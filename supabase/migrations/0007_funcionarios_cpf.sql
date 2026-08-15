-- =====================================================================
-- Funcionários: campo CPF (não existia no schema original nem no
-- modelo-dados-saas-gestao-terceiros.sql — numero_inscricao é genérico
-- demais pra servir de identificador de pessoa física).
--
-- Unicidade só dentro da mesma terceirizada (não global): a mesma pessoa
-- pode ter passado por terceirizadas diferentes ao longo do tempo.
-- =====================================================================

alter table funcionarios
    add column cpf varchar(14);

create unique index idx_funcionarios_cpf_por_terceirizada
    on funcionarios (empresa_terceirizada_id, cpf)
    where cpf is not null;
