import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Client com service_role: só é importável a partir de código de servidor
// (o import "server-only" quebra o build se algum client component importar
// este módulo). Toda leitura/escrita de dado de tenant (empresas, contratos,
// funcionários...) roda por aqui, com o escopo multi-tenant aplicado em
// TypeScript em src/lib/auth/permissions.ts — nunca via RLS recursivo.
let adminClient: SupabaseClient | undefined;

export function createAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;

  adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  return adminClient;
}
