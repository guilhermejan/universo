-- =====================================================================
-- Geração automática de "faltando" em documentos_entregues.
--
-- Até aqui, nada criava a linha de pendência quando uma empresa era
-- vinculada a um perfil documental: a tela "Regularizar Pendências" só
-- mostrava algo se alguém inserisse a linha manualmente. Essa migration
-- fecha o buraco com uma function que roda diária (via pg_cron, junto do
-- recalculo de status da 0005).
--
-- Escopo: só nível empresa (funcionario_id is null). O schema atual não
-- tem um "perfil documental" por funcionário — só empresas.perfil_documental_id
-- — então documento exigido de funcionário específico continua manual até
-- o módulo de Funcionários definir essa regra.
--
-- Duas famílias de periodicidade, duas regras:
--
-- 1. Recorrentes por competência (mensal / competencia_anual): falta uma
--    entrega nova a cada período. Gera 'faltando' se não existe NENHUMA
--    linha pra (empresa, tipo, competência-atual). Competência sempre no
--    formato "MM/AAAA" (mesma convenção de documentos_entregues.competencia
--    usada em features/pendencias); pra anual, usa "01/AAAA" como chave —
--    não existe outro formato de "ano" definido no sistema.
--
-- 2. Avulsos/por vencimento (apresentar_uma_vez, informar_data_validade,
--    periodico_data_fixa, periodico_a_partir_entrega): não têm competência,
--    renovam quando vencem. Gera 'faltando' se nunca foi entregue OU se a
--    entrega mais recente já está 'vencido' (e ninguém reenviou ainda —
--    por isso olha só a MAIS RECENTE, pra não duplicar pendência toda
--    execução).
-- =====================================================================

create or replace function gerar_pendencias_faltando()
returns void as $$
begin
    insert into documentos_entregues (empresa_terceirizada_id, tipo_documento_id, competencia, status)
    select e.id, td.id, req.chave, 'faltando'
    from empresas e
    join perfil_documento pd on pd.perfil_documental_id = e.perfil_documental_id and pd.ativo = true
    join tipos_documento td on td.id = pd.tipo_documento_id and td.ativo = true
    cross join lateral (
        select case td.periodicidade
            when 'mensal' then to_char(current_date, 'MM/YYYY')
            when 'competencia_anual' then '01/' || to_char(current_date, 'YYYY')
        end as chave
    ) req
    where e.tipo = 'terceirizada'
      and e.ativo = true
      and e.perfil_documental_id is not null
      and td.periodicidade in ('mensal', 'competencia_anual')
      and not exists (
          select 1 from documentos_entregues de
          where de.empresa_terceirizada_id = e.id
            and de.tipo_documento_id = td.id
            and de.funcionario_id is null
            and de.competencia = req.chave
      );

    insert into documentos_entregues (empresa_terceirizada_id, tipo_documento_id, status)
    select e.id, td.id, 'faltando'
    from empresas e
    join perfil_documento pd on pd.perfil_documental_id = e.perfil_documental_id and pd.ativo = true
    join tipos_documento td on td.id = pd.tipo_documento_id and td.ativo = true
    left join lateral (
        select de.status
        from documentos_entregues de
        where de.empresa_terceirizada_id = e.id
          and de.tipo_documento_id = td.id
          and de.funcionario_id is null
        order by de.criado_em desc
        limit 1
    ) ultima on true
    where e.tipo = 'terceirizada'
      and e.ativo = true
      and e.perfil_documental_id is not null
      and td.periodicidade in ('apresentar_uma_vez','informar_data_validade','periodico_data_fixa','periodico_a_partir_entrega')
      and (ultima.status is null or ultima.status = 'vencido');
end;
$$ language plpgsql;

-- Backfill imediato pro estado atual do banco.
select gerar_pendencias_faltando();

-- Agendamento diário — extensão já habilitada na 0005; roda antes do
-- recálculo de status (03:00 UTC) pra pendência nova nascer com status
-- correto já na primeira passada.
select cron.schedule(
    'gerar-pendencias-faltando-diario',
    '0 2 * * *',
    $$select gerar_pendencias_faltando()$$
);
