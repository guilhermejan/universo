import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { UsuarioProfile } from "@/lib/auth/session";

export type ContratanteContext = {
  // Fixo para admin_contratante/gestor_contrato (sempre a própria empresa).
  // null para admin_plataforma, que escolhe entre as contratantes existentes.
  contratanteFixo: number | null;
  contratanteFixoNome: string | null;
  contratantesDisponiveis: { id: number; nome_fantasia: string }[];
  podeGerenciar: boolean;
};

// Biblioteca de tipos de documento e perfis documentais são configurados por
// contratante (empresa_contratante_id). admin_plataforma não tem uma
// contratante "própria", então escolhe qual biblioteca gerenciar; os demais
// papéis ficam travados na própria empresa — mesma lógica de
// features/empresas/scope.ts.
export async function getContratanteContext(
  usuario: UsuarioProfile
): Promise<ContratanteContext> {
  const admin = createAdminClient();

  if (usuario.papel === "admin_plataforma") {
    const { data } = (await admin
      .from("empresas")
      .select("id, nome_fantasia")
      .eq("tipo", "contratante")
      .eq("ativo", true)
      .order("nome_fantasia")) as { data: { id: number; nome_fantasia: string }[] | null };

    return {
      contratanteFixo: null,
      contratanteFixoNome: null,
      contratantesDisponiveis: data ?? [],
      podeGerenciar: true,
    };
  }

  if (usuario.papel === "admin_contratante" || usuario.papel === "gestor_contrato") {
    const { data } = (await admin
      .from("empresas")
      .select("nome_fantasia")
      .eq("id", usuario.empresa_id)
      .single()) as { data: { nome_fantasia: string } | null };

    return {
      contratanteFixo: usuario.empresa_id,
      contratanteFixoNome: data?.nome_fantasia ?? null,
      contratantesDisponiveis: [],
      podeGerenciar: true,
    };
  }

  return {
    contratanteFixo: null,
    contratanteFixoNome: null,
    contratantesDisponiveis: [],
    podeGerenciar: false,
  };
}

// Resolve qual contratante está sendo gerenciada nesta request: fixa pro
// papel, ou a escolhida via `?contratante_id=` (com fallback pra primeira
// disponível) quando é o admin_plataforma que decide.
export function resolveContratanteId(
  context: ContratanteContext,
  contratanteIdParam?: string
): number | null {
  if (context.contratanteFixo) return context.contratanteFixo;
  if (contratanteIdParam) {
    const parsed = Number(contratanteIdParam);
    if (Number.isInteger(parsed)) return parsed;
  }
  return context.contratantesDisponiveis[0]?.id ?? null;
}
