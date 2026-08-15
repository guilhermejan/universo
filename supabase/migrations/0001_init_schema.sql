-- =====================================================================
-- UNIVERSO SaaS — schema inicial
-- Baseado em modelo-dados-saas-gestao-terceiros.sql (raiz do projeto),
-- com duas correções necessárias para rodar em Postgres/Supabase:
--
-- 1. Dependência circular de FK: empresas.grupo_id / empresas.perfil_documental_id
--    apontam para grupos_terceiro / perfis_documentais, que por sua vez apontam
--    de volta para empresas.empresa_contratante_id. Resolvido criando `empresas`
--    sem essas duas FKs, criando as tabelas dependentes, e só então anexando as
--    constraints via ALTER TABLE.
-- 2. usuarios.senha_hash foi removido: autenticação passa a ser 100% do
--    Supabase Auth (auth.users). `usuarios.id` é o mesmo UUID de auth.users.id
--    (perfil 1:1), o que também muda o tipo de toda FK que apontava para
--    usuarios(id) de BIGINT para UUID.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EMPRESAS (tabela única, auto-relacionada, cobre os 3 níveis)
-- ---------------------------------------------------------------------
create table empresas (
    id                    bigserial primary key,
    empresa_pai_id        bigint references empresas(id), -- null só para UNIVERSO (raiz)
    tipo                  varchar(20) not null check (tipo in ('proprietaria_saas','contratante','terceirizada')),

    razao_social          varchar(255) not null,
    nome_fantasia         varchar(150) not null,
    cnpj                  varchar(18) not null unique,
    inscricao_municipal   varchar(30),
    inscricao_estadual    varchar(30),

    endereco              varchar(255),
    numero                varchar(20),
    complemento           varchar(100),
    bairro                varchar(100),
    cidade                varchar(100),
    estado                char(2),
    cep                   varchar(10),

    responsavel_nome      varchar(150),
    responsavel_email     varchar(150),
    responsavel_telefone  varchar(20),

    -- FKs para grupos_terceiro/perfis_documentais anexadas depois (dependência circular)
    grupo_id              bigint,
    perfil_documental_id  bigint,

    ativo                 boolean not null default true,
    criado_em             timestamptz not null default now(),
    atualizado_em         timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. LOCAIS (unidades/filiais de uma empresa contratante)
-- ---------------------------------------------------------------------
create table locais (
    id          bigserial primary key,
    empresa_id  bigint not null references empresas(id),
    nome        varchar(150) not null,
    endereco    varchar(255),
    ativo       boolean not null default true
);

-- ---------------------------------------------------------------------
-- 3. GRUPOS DE TERCEIRO (classificação, ex: "Prestadores de Serviços")
-- ---------------------------------------------------------------------
create table grupos_terceiro (
    id                       bigserial primary key,
    empresa_contratante_id   bigint not null references empresas(id),
    nome                     varchar(150) not null
);

-- ---------------------------------------------------------------------
-- 4. PERFIS DOCUMENTAIS (ex: "Perfil Padrão Cessão de Mão-de-Obra")
-- ---------------------------------------------------------------------
create table perfis_documentais (
    id                       bigserial primary key,
    empresa_contratante_id   bigint not null references empresas(id),
    nome                     varchar(150) not null
);

-- agora que as duas tabelas existem, anexa as FKs pendentes de empresas
alter table empresas
    add constraint fk_empresas_grupo
        foreign key (grupo_id) references grupos_terceiro(id),
    add constraint fk_empresas_perfil
        foreign key (perfil_documental_id) references perfis_documentais(id);

-- ---------------------------------------------------------------------
-- 5. USUARIOS (perfil 1:1 com auth.users do Supabase — sem senha própria)
-- ---------------------------------------------------------------------
create table usuarios (
    id          uuid primary key references auth.users(id) on delete cascade,
    empresa_id  bigint not null references empresas(id),
    nome        varchar(150) not null,
    email       varchar(150) not null unique,
    papel       varchar(30) not null check (papel in ('admin_plataforma','admin_contratante','gestor_contrato','terceiro')),
    ativo       boolean not null default true,
    criado_em   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. TIPOS DE DOCUMENTO (biblioteca, ex: "CERTIDÃO NEGATIVA MUNICIPAL")
-- ---------------------------------------------------------------------
create table tipos_documento (
    id                       bigserial primary key,
    empresa_contratante_id   bigint not null references empresas(id),
    codigo                   varchar(10) not null,
    descricao                varchar(255) not null,
    periodicidade            varchar(30) not null check (periodicidade in (
                                'apresentar_uma_vez','mensal','competencia_anual',
                                'informar_data_validade','periodico')),
    modo_cadastro            varchar(20) default 'padrao',
    ativo                    boolean not null default true
);

-- ---------------------------------------------------------------------
-- 7. PERFIL x TIPOS DE DOCUMENTO (quais documentos cada perfil exige)
-- ---------------------------------------------------------------------
create table perfil_documento (
    perfil_documental_id  bigint not null references perfis_documentais(id),
    tipo_documento_id     bigint not null references tipos_documento(id),
    obrigatorio           boolean not null default true,
    bloqueia_acesso       boolean not null default false,
    primary key (perfil_documental_id, tipo_documento_id)
);

-- ---------------------------------------------------------------------
-- 8. CONTRATOS (vínculo formal entre contratante e terceirizada)
-- ---------------------------------------------------------------------
create table contratos (
    id                          bigserial primary key,
    empresa_contratante_id      bigint not null references empresas(id),
    empresa_terceirizada_id     bigint not null references empresas(id),
    local_id                    bigint references locais(id),
    gestor_contrato_usuario_id  uuid references usuarios(id),
    numero_contrato             varchar(50),
    data_inicio                 date,
    data_fim                    date,
    status                      varchar(20) not null default 'ativo' check (status in ('ativo','vencido','encerrado')),
    criado_em                   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 9. FUNCIONÁRIOS (vinculados à empresa terceirizada)
-- ---------------------------------------------------------------------
create table funcionarios (
    id                        bigserial primary key,
    empresa_terceirizada_id   bigint not null references empresas(id),
    contrato_id               bigint references contratos(id),
    numero_inscricao          varchar(30),
    nome                      varchar(150) not null,
    cargo                     varchar(100),
    situacao                  varchar(20) not null default 'ativo' check (situacao in ('ativo','desligado')),
    cracha_virtual_url        varchar(255),
    criado_em                 timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 10. DOCUMENTOS ENTREGUES (o "coração" do dashboard de conformidade)
-- ---------------------------------------------------------------------
create table documentos_entregues (
    id                        bigserial primary key,
    empresa_terceirizada_id   bigint not null references empresas(id),
    funcionario_id            bigint references funcionarios(id),
    tipo_documento_id         bigint not null references tipos_documento(id),

    arquivo_url               varchar(255),
    competencia               varchar(7),
    data_entrega              date,
    data_validade             date,
    status                    varchar(30) not null default 'entregue_a_conferir' check (status in (
                                'valido','entregue_a_conferir','a_vencer','vencido','faltando')),

    validado_por_ia           boolean not null default false,
    validado_por_usuario_id   uuid references usuarios(id),

    criado_em                 timestamptz not null default now(),
    atualizado_em             timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 11. AUDITORIA DE CAMPO (checklists de inspeção, fase 2)
-- ---------------------------------------------------------------------
create table auditorias_campo (
    id                        bigserial primary key,
    empresa_terceirizada_id   bigint not null references empresas(id),
    local_id                  bigint references locais(id),
    usuario_auditor_id        uuid references usuarios(id),
    data_auditoria            date not null,
    resultado                 varchar(20) check (resultado in ('conforme','nao_conforme','parcial')),
    observacoes               text
);

-- ---------------------------------------------------------------------
-- 12. LOG DE ACESSO FÍSICO (fase 3, integração com catracas/leitoras)
-- ---------------------------------------------------------------------
create table registros_acesso (
    id              bigserial primary key,
    funcionario_id  bigint not null references funcionarios(id),
    local_id        bigint not null references locais(id),
    tipo            varchar(10) not null check (tipo in ('entrada','saida')),
    registrado_em   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Índices de apoio às consultas mais comuns
-- ---------------------------------------------------------------------
create index idx_empresas_empresa_pai_id on empresas(empresa_pai_id);
create index idx_empresas_tipo on empresas(tipo);
create index idx_usuarios_empresa_id on usuarios(empresa_id);
create index idx_contratos_contratante on contratos(empresa_contratante_id);
create index idx_contratos_terceirizada on contratos(empresa_terceirizada_id);
create index idx_funcionarios_terceirizada on funcionarios(empresa_terceirizada_id);
create index idx_documentos_terceirizada on documentos_entregues(empresa_terceirizada_id);

-- ---------------------------------------------------------------------
-- Mantém atualizado_em em dia
-- ---------------------------------------------------------------------
create function set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_empresas_atualizado_em
    before update on empresas
    for each row execute function set_atualizado_em();

create trigger trg_documentos_atualizado_em
    before update on documentos_entregues
    for each row execute function set_atualizado_em();
