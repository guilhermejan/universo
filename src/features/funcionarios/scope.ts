import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getVisibleEmpresaIds } from "@/lib/auth/permissions";
import type { UsuarioProfile } from "@/lib/auth/session";

export type TerceirizadaContext = {
  // Fixo para 'terceiro' (sempre a própria empresa). null pros demais
  // papéis, que escolhem entre as terceirizadas visíveis.
  terceirizadaFixa: number | null;
  terceirizadaFixaNome: string | null;
  terceirizadasDisponiveis: { id: number; nome_fantasia: string }[];
};

// Funcionários são cadastrados por terceirizada (empresa_terceirizada_id).
// Mesma lógica de escopo de features/documentos/scope.ts, só que em vez de
// "qual contratante" é "qual terceirizada".
export async function getTerceirizadaContext(usuario: UsuarioProfile): Promise<TerceirizadaContext> {
  const admin = createAdminClient();

  if (usuario.papel === "terceiro") {
    const { data } = (await admin
      .from("empresas")
      .select("nome_fantasia")
      .eq("id", usuario.empresa_id)
      .single()) as { data: { nome_fantasia: string } | null };

    return {
      terceirizadaFixa: usuario.empresa_id,
      terceirizadaFixaNome: data?.nome_fantasia ?? null,
      terceirizadasDisponiveis: [],
    };
  }

  const visiveis = await getVisibleEmpresaIds(usuario);
  let query = admin
    .from("empresas")
    .select("id, nome_fantasia")
    .eq("tipo", "terceirizada")
    .eq("ativo", true)
    .order("nome_fantasia");

  if (visiveis !== "all") {
    query = query.in("id", visiveis);
  }

  const { data } = (await query) as { data: { id: number; nome_fantasia: string }[] | null };

  return {
    terceirizadaFixa: null,
    terceirizadaFixaNome: null,
    terceirizadasDisponiveis: data ?? [],
  };
}

export function resolveTerceirizadaId(
  context: TerceirizadaContext,
  terceirizadaIdParam?: string
): number | null {
  if (context.terceirizadaFixa) return context.terceirizadaFixa;
  if (terceirizadaIdParam) {
    const parsed = Number(terceirizadaIdParam);
    if (Number.isInteger(parsed)) return parsed;
  }
  return context.terceirizadasDisponiveis[0]?.id ?? null;
}
