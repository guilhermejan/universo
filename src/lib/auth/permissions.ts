import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PapelUsuario } from "@/lib/types/database.types";
import type { UsuarioProfile } from "@/lib/auth/session";

export class PermissaoNegadaError extends Error {
  constructor(message = "Você não tem permissão para executar esta ação.") {
    super(message);
    this.name = "PermissaoNegadaError";
  }
}

export function requireRole(usuario: UsuarioProfile, papeis: PapelUsuario[]) {
  if (!papeis.includes(usuario.papel)) {
    throw new PermissaoNegadaError();
  }
}

// Regra de visibilidade dos 3 níveis da hierarquia:
// - admin_plataforma (UNIVERSO): enxerga tudo.
// - admin_contratante / gestor_contrato: a própria empresa contratante +
//   suas terceirizadas diretas (um único nível abaixo, sem recursão).
// - terceiro: só a própria empresa.
export async function getVisibleEmpresaIds(
  usuario: UsuarioProfile
): Promise<number[] | "all"> {
  if (usuario.papel === "admin_plataforma") {
    return "all";
  }

  if (usuario.papel === "admin_contratante" || usuario.papel === "gestor_contrato") {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("empresas")
      .select("id")
      .eq("empresa_pai_id", usuario.empresa_id);

    if (error) throw error;

    return [usuario.empresa_id, ...(data as { id: number }[]).map((row) => row.id)];
  }

  return [usuario.empresa_id];
}

// Confirma que `empresaId` está dentro do escopo visível do usuário antes de
// uma leitura/mutação pontual (ex.: abrir /empresas/[id]/editar).
export async function assertEmpresaVisivel(usuario: UsuarioProfile, empresaId: number) {
  const visiveis = await getVisibleEmpresaIds(usuario);
  if (visiveis !== "all" && !visiveis.includes(empresaId)) {
    throw new PermissaoNegadaError("Você não tem acesso a esta empresa.");
  }
}
