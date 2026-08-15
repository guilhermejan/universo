-- =====================================================================
-- Row Level Security — rede de segurança "deny by default"
--
-- A regra real de visibilidade multi-tenant (3 níveis: UNIVERSO > contratante
-- > terceirizada) é aplicada em código de servidor (src/lib/auth/permissions.ts),
-- usando o client service_role, que nunca chega ao browser. RLS aqui existe
-- como defesa em profundidade: se algum dia um bug usar o client errado (ex.
-- anon key no browser fazendo query direta), a falha vira "sem permissão",
-- nunca um vazamento entre tenants.
--
-- A única policy necessária para o app funcionar é a de usuarios: o próprio
-- usuário logado precisa conseguir ler seu registro de perfil (papel,
-- empresa_id) via anon key + JWT da sessão, sem depender do service_role.
-- =====================================================================

alter table empresas enable row level security;
alter table locais enable row level security;
alter table usuarios enable row level security;
alter table grupos_terceiro enable row level security;
alter table perfis_documentais enable row level security;
alter table tipos_documento enable row level security;
alter table perfil_documento enable row level security;
alter table contratos enable row level security;
alter table funcionarios enable row level security;
alter table documentos_entregues enable row level security;
alter table auditorias_campo enable row level security;
alter table registros_acesso enable row level security;

create policy usuarios_select_own on usuarios
    for select
    using (id = auth.uid());
