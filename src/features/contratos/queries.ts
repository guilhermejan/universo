import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ContratoRow } from "@/lib/types/database.types";
import type { ContratoComRelacoes } from "@/features/contratos/types";

// Join manual em vez de embed do PostgREST: `contratos` tem duas FKs pra
// `empresas` (contratante e terceirizada), o que deixa a resolução de embed
// ambígua/instável — mesmo problema documentado em
// features/empresas/queries.ts pro self-join de empresa-pai.
export async function listContratos(contratanteId: number): Promise<ContratoComRelacoes[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("contratos")
    .select("*")
    .eq("empresa_contratante_id", contratanteId)
    .order("criado_em", { ascending: false });

  if (error) throw error;
  const contratos = (data ?? []) as ContratoRow[];

  const terceirizadaIds = [...new Set(contratos.map((c) => c.empresa_terceirizada_id))];
  const gestorIds = [...new Set(contratos.map((c) => c.gestor_contrato_usuario_id).filter((id): id is string => id != null))];

  const nomesEmpresa = new Map<number, string>();
  if (terceirizadaIds.length > 0) {
    const { data: empresas, error: erroEmpresas } = await admin
      .from("empresas")
      .select("id, nome_fantasia")
      .in("id", terceirizadaIds);
    if (erroEmpresas) throw erroEmpresas;
    for (const e of (empresas ?? []) as { id: number; nome_fantasia: string }[]) {
      nomesEmpresa.set(e.id, e.nome_fantasia);
    }
  }

  const nomesGestor = new Map<string, string>();
  if (gestorIds.length > 0) {
    const { data: gestores, error: erroGestores } = await admin
      .from("usuarios")
      .select("id, nome")
      .in("id", gestorIds);
    if (erroGestores) throw erroGestores;
    for (const g of (gestores ?? []) as { id: string; nome: string }[]) {
      nomesGestor.set(g.id, g.nome);
    }
  }

  return contratos.map((c) => ({
    ...c,
    terceirizada_nome: nomesEmpresa.get(c.empresa_terceirizada_id) ?? "—",
    gestor_nome: c.gestor_contrato_usuario_id ? (nomesGestor.get(c.gestor_contrato_usuario_id) ?? null) : null,
  }));
}

export async function getContratoById(id: number): Promise<ContratoRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("contratos").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as ContratoRow | null;
}

export async function listTerceirizadasDaContratante(
  contratanteId: number
): Promise<{ id: number; nome_fantasia: string }[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("empresas")
    .select("id, nome_fantasia")
    .eq("empresa_pai_id", contratanteId)
    .eq("tipo", "terceirizada")
    .eq("ativo", true)
    .order("nome_fantasia");

  if (error) throw error;
  return (data ?? []) as { id: number; nome_fantasia: string }[];
}

export async function listGestoresDaContratante(
  contratanteId: number
): Promise<{ id: string; nome: string }[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("usuarios")
    .select("id, nome")
    .eq("empresa_id", contratanteId)
    .eq("papel", "gestor_contrato")
    .eq("ativo", true)
    .order("nome");

  if (error) throw error;
  return (data ?? []) as { id: string; nome: string }[];
}
