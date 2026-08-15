-- =====================================================================
-- MODELO DE DADOS — SaaS de Gestão de Terceiros e Controle de Acesso
-- Empresa dona da plataforma: UNIVERSO
-- =====================================================================
-- Hierarquia:
--   UNIVERSO (proprietaria_saas)
--     -> Empresas Contratantes (ex: RHODIA BRASIL)
--          -> Empresas Terceirizadas/Prestadoras (ex: UNIVERSO SOLUÇÃO - CATIVA)
--               -> Funcionários
--               -> Documentos entregues
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. EMPRESAS (tabela única, auto-relacionada, cobre os 3 níveis)
-- ---------------------------------------------------------------------
CREATE TABLE empresas (
    id                  BIGSERIAL PRIMARY KEY,
    empresa_pai_id      BIGINT REFERENCES empresas(id), -- NULL só para UNIVERSO (raiz)
    tipo                VARCHAR(20) NOT NULL CHECK (tipo IN ('proprietaria_saas','contratante','terceirizada')),

    razao_social        VARCHAR(255) NOT NULL,
    nome_fantasia       VARCHAR(150) NOT NULL,
    cnpj                VARCHAR(18) NOT NULL UNIQUE,
    inscricao_municipal VARCHAR(30),
    inscricao_estadual  VARCHAR(30),

    endereco            VARCHAR(255),
    numero              VARCHAR(20),
    complemento         VARCHAR(100),
    bairro              VARCHAR(100),
    cidade              VARCHAR(100),
    estado              CHAR(2),
    cep                 VARCHAR(10),

    responsavel_nome    VARCHAR(150),
    responsavel_email   VARCHAR(150),
    responsavel_telefone VARCHAR(20),

    grupo_id            BIGINT REFERENCES grupos_terceiro(id), -- só relevante p/ tipo='terceirizada'
    perfil_documental_id BIGINT REFERENCES perfis_documentais(id), -- idem

    ativo               BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMP NOT NULL DEFAULT now(),
    atualizado_em       TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 2. CONFIGURAÇÃO DE LOCAL (unidades/filiais de uma empresa contratante)
-- ---------------------------------------------------------------------
CREATE TABLE locais (
    id              BIGSERIAL PRIMARY KEY,
    empresa_id      BIGINT NOT NULL REFERENCES empresas(id), -- empresa contratante dona do local
    nome            VARCHAR(150) NOT NULL,   -- ex: "RHODIA BRASIL - Unidade SP"
    endereco        VARCHAR(255),
    ativo           BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- 3. USUÁRIOS (acesso ao sistema)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id              BIGSERIAL PRIMARY KEY,
    empresa_id      BIGINT NOT NULL REFERENCES empresas(id), -- a qual empresa pertence
    nome            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    senha_hash      VARCHAR(255) NOT NULL,
    papel           VARCHAR(30) NOT NULL CHECK (papel IN ('admin_plataforma','admin_contratante','gestor_contrato','terceiro')),
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 4. GRUPOS DE TERCEIRO (classificação, ex: "Prestadores de Serviços")
-- ---------------------------------------------------------------------
CREATE TABLE grupos_terceiro (
    id              BIGSERIAL PRIMARY KEY,
    empresa_contratante_id BIGINT NOT NULL REFERENCES empresas(id),
    nome            VARCHAR(150) NOT NULL
);

-- ---------------------------------------------------------------------
-- 5. PERFIS DOCUMENTAIS (ex: "Perfil Padrão Cessão de Mão-de-Obra")
-- ---------------------------------------------------------------------
CREATE TABLE perfis_documentais (
    id              BIGSERIAL PRIMARY KEY,
    empresa_contratante_id BIGINT NOT NULL REFERENCES empresas(id),
    nome            VARCHAR(150) NOT NULL
);

-- ---------------------------------------------------------------------
-- 6. TIPOS DE DOCUMENTO (biblioteca, ex: "CERTIDÃO NEGATIVA MUNICIPAL")
-- ---------------------------------------------------------------------
CREATE TABLE tipos_documento (
    id              BIGSERIAL PRIMARY KEY,
    empresa_contratante_id BIGINT NOT NULL REFERENCES empresas(id), -- cada contratante define sua biblioteca
    codigo          VARCHAR(10) NOT NULL,          -- ex: "0007"
    descricao       VARCHAR(255) NOT NULL,
    periodicidade   VARCHAR(30) NOT NULL CHECK (periodicidade IN (
                        'apresentar_uma_vez','mensal','competencia_anual',
                        'informar_data_validade','periodico')),
    modo_cadastro   VARCHAR(20) DEFAULT 'padrao',
    ativo           BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- 7. PERFIL x TIPOS DE DOCUMENTO (quais documentos cada perfil exige)
-- ---------------------------------------------------------------------
CREATE TABLE perfil_documento (
    perfil_documental_id BIGINT NOT NULL REFERENCES perfis_documentais(id),
    tipo_documento_id     BIGINT NOT NULL REFERENCES tipos_documento(id),
    obrigatorio           BOOLEAN NOT NULL DEFAULT TRUE,
    bloqueia_acesso        BOOLEAN NOT NULL DEFAULT FALSE, -- "Bloqueia acesso" visto no print
    PRIMARY KEY (perfil_documental_id, tipo_documento_id)
);

-- ---------------------------------------------------------------------
-- 8. CONTRATOS (vínculo formal entre contratante e terceirizada)
-- ---------------------------------------------------------------------
CREATE TABLE contratos (
    id                      BIGSERIAL PRIMARY KEY,
    empresa_contratante_id  BIGINT NOT NULL REFERENCES empresas(id),
    empresa_terceirizada_id BIGINT NOT NULL REFERENCES empresas(id),
    local_id                BIGINT REFERENCES locais(id),
    gestor_contrato_usuario_id BIGINT REFERENCES usuarios(id),
    numero_contrato         VARCHAR(50),
    data_inicio             DATE,
    data_fim                DATE,
    status                  VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','vencido','encerrado')),
    criado_em                TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 9. FUNCIONÁRIOS (vinculados à empresa terceirizada)
-- ---------------------------------------------------------------------
CREATE TABLE funcionarios (
    id                       BIGSERIAL PRIMARY KEY,
    empresa_terceirizada_id  BIGINT NOT NULL REFERENCES empresas(id),
    contrato_id              BIGINT REFERENCES contratos(id),
    numero_inscricao         VARCHAR(30),
    nome                     VARCHAR(150) NOT NULL,
    cargo                    VARCHAR(100),
    situacao                 VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (situacao IN ('ativo','desligado')),
    crachá_virtual_url       VARCHAR(255),
    criado_em                TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 10. DOCUMENTOS ENTREGUES (o "coração" do dashboard de conformidade)
-- ---------------------------------------------------------------------
CREATE TABLE documentos_entregues (
    id                       BIGSERIAL PRIMARY KEY,
    empresa_terceirizada_id  BIGINT NOT NULL REFERENCES empresas(id),
    funcionario_id           BIGINT REFERENCES funcionarios(id), -- NULL quando o documento é da empresa, não da pessoa
    tipo_documento_id        BIGINT NOT NULL REFERENCES tipos_documento(id),

    arquivo_url              VARCHAR(255),
    competencia              VARCHAR(7),   -- ex: "04/2022", quando aplicável
    data_entrega             DATE,
    data_validade             DATE,        -- ex: 31/12/9999 quando não expira
    status                   VARCHAR(30) NOT NULL DEFAULT 'entregue_a_conferir' CHECK (status IN (
                                'valido','entregue_a_conferir','a_vencer','vencido','faltando')),

    validado_por_ia          BOOLEAN NOT NULL DEFAULT FALSE,
    validado_por_usuario_id  BIGINT REFERENCES usuarios(id),

    criado_em                 TIMESTAMP NOT NULL DEFAULT now(),
    atualizado_em              TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 11. AUDITORIA DE CAMPO (checklists de inspeção, fase 2)
-- ---------------------------------------------------------------------
CREATE TABLE auditorias_campo (
    id                       BIGSERIAL PRIMARY KEY,
    empresa_terceirizada_id  BIGINT NOT NULL REFERENCES empresas(id),
    local_id                 BIGINT REFERENCES locais(id),
    usuario_auditor_id       BIGINT REFERENCES usuarios(id),
    data_auditoria           DATE NOT NULL,
    resultado                VARCHAR(20) CHECK (resultado IN ('conforme','nao_conforme','parcial')),
    observacoes              TEXT
);

-- ---------------------------------------------------------------------
-- 12. LOG DE ACESSO FÍSICO (fase 3, integração com catracas/leitoras)
-- ---------------------------------------------------------------------
CREATE TABLE registros_acesso (
    id              BIGSERIAL PRIMARY KEY,
    funcionario_id  BIGINT NOT NULL REFERENCES funcionarios(id),
    local_id        BIGINT NOT NULL REFERENCES locais(id),
    tipo            VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada','saida')),
    registrado_em   TIMESTAMP NOT NULL DEFAULT now()
);

-- =====================================================================
-- NOTAS DE IMPLEMENTAÇÃO
-- =====================================================================
-- 1. A UNIVERSO é o único registro com tipo='proprietaria_saas' e empresa_pai_id NULL.
--    Todo admin da UNIVERSO enxerga todas as empresas contratantes e suas terceirizadas.
-- 2. Multi-tenancy por escopo: toda query de uma empresa_contratante filtra
--    automaticamente por empresa_id (isolamento entre clientes da UNIVERSO).
-- 3. O "semáforo" do dashboard (verde/azul/amarelo/vermelho) é calculado em cima
--    de documentos_entregues.status + data_validade — não precisa de tabela própria,
--    é uma view ou cálculo em tempo de consulta.
-- 4. grupos_terceiro e perfis_documentais têm FK circular com empresas (empresas
--    referenciam perfil/grupo, e estes referenciam empresa_contratante). Em Postgres,
--    crie as tabelas 4 e 5 antes da 1, ou adicione as FKs de empresas via ALTER TABLE
--    após criar todas as tabelas.
-- =====================================================================
