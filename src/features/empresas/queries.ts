import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getVisibleEmpresaIds } from "@/lib/auth/permissions";
import type { UsuarioProfile } from "@/lib/auth/session";
import type { EmpresaComPai } from "@/features/empresas/types";
import type { EmpresaRow, TipoEmpresa } from "@/lib/types/database.types";

export type EmpresaFilters = {
  tipo?: TipoEmpresa;
  empresaPaiId?: number;
};

export async function listEmpresas(
  usuario: UsuarioProfile,
  filters: EmpresaFilters = {}
): Promise<EmpresaComPai[]> {
  const visiveis = await getVisibleEmpresaIds(usuario);
  if (visiveis !== "all" && visiveis.length === 0) return [];

  const admin = createAdminClient();
  let query = admin.from("empresas").select("*").order("razao_social");

  if (visiveis !== "all") {
    query = query.in("id", visiveis);
  }
  if (filters.tipo) {
    query = query.eq("tipo", filters.tipo);
  }
  if (filters.empresaPaiId) {
    query = query.eq("empresa_pai_id", filters.empresaPaiId);
  }

  const { data, error } = await query;
  if (error) throw error;
  const empresas = (data ?? []) as EmpresaRow[];

  // Join manual em vez de embed do PostgREST: o self-join
  // `empresas!empresa_pai_id(...)` não estava resolvendo de forma confiável
  // (voltava null mesmo com o FK correto no banco), então busca-se os nomes
  // das empresas-pai à parte e faz-se o merge aqui.
  const paiIds = [...new Set(empresas.map((e) => e.empresa_pai_id).filter((id): id is number => id != null))];
  const nomesPorId = new Map<number, string>();
  if (paiIds.length > 0) {
    const { data: pais, error: erroPais } = await admin
      .from("empresas")
      .select("id, nome_fantasia")
      .in("id", paiIds);
    if (erroPais) throw erroPais;
    for (const pai of (pais ?? []) as { id: number; nome_fantasia: string }[]) {
      nomesPorId.set(pai.id, pai.nome_fantasia);
    }
  }

  return empresas.map((empresa) => ({
    ...empresa,
    empresa_pai_nome: empresa.empresa_pai_id
      ? (nomesPorId.get(empresa.empresa_pai_id) ?? null)
      : null,
  }));
}

export async function getEmpresaById(id: number): Promise<EmpresaRow> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("empresas").select("*").eq("id", id).single();
  if (error) throw error;
  return data as EmpresaRow;
}

// Opções de "empresa-pai" visíveis ao usuário para os filtros da listagem
// (não confundir com o contexto do formulário de criação, que tem regras
// mais restritas — ver features/empresas/scope.ts).
export async function listEmpresasVisiveisParaFiltro(
  usuario: UsuarioProfile
): Promise<{ id: number; nome_fantasia: string; tipo: TipoEmpresa }[]> {
  const visiveis = await getVisibleEmpresaIds(usuario);
  const admin = createAdminClient();

  let query = admin
    .from("empresas")
    .select("id, nome_fantasia, tipo")
    .neq("tipo", "terceirizada")
    .order("nome_fantasia");

  if (visiveis !== "all") {
    query = query.in("id", visiveis);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as { id: number; nome_fantasia: string; tipo: TipoEmpresa }[];
}
