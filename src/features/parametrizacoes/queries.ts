import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ParametrizacaoAgrupamentoRow,
  ParametrizacaoParametroRow,
  ParametrizacaoPerfilRow,
} from "@/lib/types/database.types";

export async function listAgrupamentos(): Promise<ParametrizacaoAgrupamentoRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("parametrizacao_agrupamentos")
    .select("*")
    .order("codigo");

  if (error) throw error;
  return (data ?? []) as ParametrizacaoAgrupamentoRow[];
}

export async function listParametros(agrupamentoId: number): Promise<ParametrizacaoParametroRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("parametrizacao_parametros")
    .select("*")
    .eq("agrupamento_id", agrupamentoId)
    .order("codigo");

  if (error) throw error;
  return (data ?? []) as ParametrizacaoParametroRow[];
}

export async function getParametroById(id: number): Promise<ParametrizacaoParametroRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("parametrizacao_parametros")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as ParametrizacaoParametroRow | null;
}

export async function listPerfisParametrizacao(
  parametroId: number,
  contratanteId: number
): Promise<ParametrizacaoPerfilRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("parametrizacao_perfis")
    .select("*")
    .eq("parametro_id", parametroId)
    .eq("empresa_contratante_id", contratanteId)
    .order("tipo_entidade")
    .order("codigo");

  if (error) throw error;
  return (data ?? []) as ParametrizacaoPerfilRow[];
}

export async function getPerfilParametrizacaoById(
  id: number
): Promise<ParametrizacaoPerfilRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("parametrizacao_perfis")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as ParametrizacaoPerfilRow | null;
}
