import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { GrupoTerceiroRow } from "@/lib/types/database.types";

export async function listGrupos(contratanteId: number): Promise<GrupoTerceiroRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("grupos_terceiro")
    .select("*")
    .eq("empresa_contratante_id", contratanteId)
    .order("nome");

  if (error) throw error;
  return (data ?? []) as GrupoTerceiroRow[];
}

export async function getGrupoById(id: number): Promise<GrupoTerceiroRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("grupos_terceiro")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as GrupoTerceiroRow | null;
}

// Grupos ativos de uma contratante, para o Select de "Grupo" no cadastro de
// empresas terceirizadas (features/empresas).
export async function listGruposAtivosParaSelect(
  contratanteId: number
): Promise<{ id: number; nome: string }[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("grupos_terceiro")
    .select("id, nome")
    .eq("empresa_contratante_id", contratanteId)
    .eq("ativo", true)
    .order("nome");

  if (error) throw error;
  return (data ?? []) as { id: number; nome: string }[];
}
