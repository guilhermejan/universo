-- =====================================================================
-- Módulo Documentos — colunas que faltavam em relação à especificação
-- (DOCUMENTOS_MODULO.md) e que não estavam em 0001_init_schema.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- tipos_documento: campos da Tela A (Cadastro de Tipo de Documento)
-- ---------------------------------------------------------------------
alter table tipos_documento
    add column permitir_editar_entrega     boolean not null default true,
    add column frequencia_meses            integer,
    add column formato_apresentacao        varchar(100),
    add column funcao                      varchar(50) not null default 'padrao',
    add column envia_email                 boolean not null default false,
    add column anexo_obrigatorio           boolean not null default true,
    add column permite_isencao             boolean not null default false,
    add column contabilizar_pontualidade   boolean not null default true;

-- periodicidade: separa o antigo valor único 'periodico' em 'periodico_data_fixa'
-- (validade fixa, informada manualmente) e 'periodico_a_partir_entrega' (a
-- validade é calculada como data_entrega + frequencia_meses). Projeto ainda
-- sem dados em produção, então a troca de enum é direta, sem UPDATE de linhas.
alter table tipos_documento drop constraint tipos_documento_periodicidade_check;
alter table tipos_documento add constraint tipos_documento_periodicidade_check
    check (periodicidade in (
        'apresentar_uma_vez','mensal','competencia_anual',
        'informar_data_validade','periodico_data_fixa','periodico_a_partir_entrega'));

alter table tipos_documento add constraint tipos_documento_frequencia_meses_check
    check (
        (periodicidade = 'periodico_a_partir_entrega' and frequencia_meses is not null and frequencia_meses > 0)
        or (periodicidade <> 'periodico_a_partir_entrega' and frequencia_meses is null)
    );

-- ---------------------------------------------------------------------
-- perfil_documento: "dias de tolerância" por vínculo (Tela B)
-- ---------------------------------------------------------------------
alter table perfil_documento
    add column dias_tolerancia integer not null default 0;

-- ---------------------------------------------------------------------
-- documentos_entregues: observação do lançamento (Tela C)
-- ---------------------------------------------------------------------
alter table documentos_entregues
    add column observacao text;

-- ---------------------------------------------------------------------
-- documentos_entregues_anexos: um lançamento pode ter mais de um arquivo
-- digitalizado anexado (a coluna documentos_entregues.arquivo_url sozinha
-- só comporta um). Mantém arquivo_url como "principal/legado" e passa a
-- guardar a lista completa aqui.
-- ---------------------------------------------------------------------
create table documentos_entregues_anexos (
    id                      bigserial primary key,
    documento_entregue_id   bigint not null references documentos_entregues(id) on delete cascade,
    arquivo_url             varchar(500) not null,
    nome_arquivo            varchar(255),
    criado_em               timestamptz not null default now()
);

create index idx_documentos_anexos_documento on documentos_entregues_anexos(documento_entregue_id);

alter table documentos_entregues_anexos enable row level security;

-- ---------------------------------------------------------------------
-- Storage: bucket privado para os anexos digitalizados. Upload/leitura
-- passam pelo client admin (service_role) em código de servidor, então não
-- precisa de storage policy pra anon/authenticated — mesma lógica de
-- "RLS como defesa em profundidade" usada nas tabelas (ver 0002_rls.sql).
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documentos-anexos', 'documentos-anexos', false)
on conflict (id) do nothing;
