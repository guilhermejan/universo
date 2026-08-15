-- =====================================================================
-- Recálculo automático de status de documentos_entregues.
--
-- Até aqui, `status` era uma coluna estática: nada no sistema mudava
-- 'valido'/'a_vencer' pra 'vencido' quando a data de validade passava —
-- só um UPDATE manual resolvia. Essa migration fecha esse buraco com uma
-- function + pg_cron diário.
--
-- Regra (só mexe em linhas com validação já resolvida — 'valido' ou
-- 'a_vencer' — nunca em 'entregue_a_conferir', que aguarda revisão
-- humana, nem em 'faltando', que não tem data_validade de verdade):
--   - data_validade < hoje              -> vencido
--   - hoje <= data_validade <= hoje+30  -> a_vencer
--   - data_validade > hoje+30           -> valido (cobre validade estendida)
--
-- Janela de 30 dias é a única definida no sistema até agora — não existe
-- config de "dias de antecedência" por tipo de documento; fica como
-- possível evolução futura (campo em tipos_documento).
-- =====================================================================

create or replace function recalcular_status_documentos()
returns void as $$
begin
    update documentos_entregues
    set status = 'vencido',
        atualizado_em = now()
    where status in ('valido', 'a_vencer')
      and data_validade is not null
      and data_validade < current_date;

    update documentos_entregues
    set status = 'a_vencer',
        atualizado_em = now()
    where status in ('valido', 'a_vencer')
      and data_validade is not null
      and data_validade >= current_date
      and data_validade <= current_date + interval '30 days';

    update documentos_entregues
    set status = 'valido',
        atualizado_em = now()
    where status in ('valido', 'a_vencer')
      and data_validade is not null
      and data_validade > current_date + interval '30 days';
end;
$$ language plpgsql;

-- pg_cron é a extensão oficial do Supabase pra jobs agendados (roda dentro
-- do próprio Postgres, sem infra externa). Precisa estar habilitada no
-- projeto (Database > Extensions > pg_cron) — o create acima é idempotente
-- e não falha se já estiver habilitada; se o projeto não tiver a extensão
-- disponível no plano, essa linha falha e o schedule abaixo não roda (a
-- function em si continua utilizável via chamada manual/RPC).
create extension if not exists pg_cron with schema extensions;

select cron.schedule(
    'recalcular-status-documentos-diario',
    '0 3 * * *', -- 03:00 UTC todo dia — fora do horário comercial BR
    $$select recalcular_status_documentos()$$
);
