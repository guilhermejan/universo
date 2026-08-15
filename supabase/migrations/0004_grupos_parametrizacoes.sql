-- =====================================================================
-- Grupos de terceiro (completa a tabela do 0001, que só tinha `nome`) e
-- módulo de Parametrizações (motor genérico Agrupamento > Parâmetro >
-- Perfil, fase 2/3 do BRIEFING.md — MVP com 1 agrupamento/parâmetro
-- seedado, extensível sem migration nova pra novos parâmetros).
-- =====================================================================

-- ---------------------------------------------------------------------
-- grupos_terceiro: código + ativo, no padrão dos demais cadastros
-- (tipos_documento, empresas) — toggle de soft-delete na listagem.
-- ---------------------------------------------------------------------
alter table grupos_terceiro
    add column codigo varchar(10),
    add column ativo  boolean not null default true;

-- vincula empresas terceirizadas a um grupo (nome já cita `grupo_id`,
-- só faltava a lógica de negócio/tela em cima).
create index idx_empresas_grupo_id on empresas(grupo_id);

-- ---------------------------------------------------------------------
-- perfil_documento: habilitar/desabilitar o vínculo sem excluir (Tela B
-- só tinha exclusão definitiva via lixeira).
-- ---------------------------------------------------------------------
alter table perfil_documento
    add column ativo boolean not null default true;

-- ---------------------------------------------------------------------
-- Parametrizações: Agrupamento (categoria macro) > Parâmetro (tela
-- específica dentro do agrupamento) > Perfis (linhas do grid, com nível
-- de aprovação e modo de cadastro), tudo escopado por contratante.
-- ---------------------------------------------------------------------
create table parametrizacao_agrupamentos (
    id      bigserial primary key,
    codigo  varchar(10) not null unique,
    nome    varchar(150) not null
);

create table parametrizacao_parametros (
    id             bigserial primary key,
    agrupamento_id bigint not null references parametrizacao_agrupamentos(id),
    codigo         varchar(10) not null,
    nome           varchar(150) not null,
    unique (agrupamento_id, codigo)
);

create table parametrizacao_perfis (
    id                       bigserial primary key,
    parametro_id             bigint not null references parametrizacao_parametros(id),
    empresa_contratante_id   bigint not null references empresas(id),
    tipo_entidade            varchar(20) not null check (tipo_entidade in ('contrato','empresa','funcionario')),
    codigo                   varchar(10) not null,
    descricao                varchar(255) not null,
    nivel_aprovacao          varchar(20) not null default 'nenhum' check (nivel_aprovacao in ('nenhum','gestor_contrato','admin_contratante')),
    modo_cadastro            varchar(100),
    criado_em                timestamptz not null default now()
);

create index idx_parametrizacao_perfis_parametro on parametrizacao_perfis(parametro_id, empresa_contratante_id);

insert into parametrizacao_agrupamentos (codigo, nome) values ('1', 'Básicos');
insert into parametrizacao_parametros (agrupamento_id, codigo, nome)
    select id, '10', 'Perfil de parametrização' from parametrizacao_agrupamentos where codigo = '1';

alter table parametrizacao_agrupamentos enable row level security;
alter table parametrizacao_parametros enable row level security;
alter table parametrizacao_perfis enable row level security;
