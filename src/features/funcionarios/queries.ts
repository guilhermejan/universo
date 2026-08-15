import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { FuncionarioRow } from "@/lib/types/database.types";

export async function listFuncionarios(terceirizadaId: number): Promise<FuncionarioRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("funcionarios")
    .select("*")
    .eq("empresa_terceirizada_id", terceirizadaId)
    .order("nome");

  if (error) throw error;
  return (data ?? []) as FuncionarioRow[];
}

export async function getFuncionarioById(id: number): Promise<FuncionarioRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("funcionarios").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as FuncionarioRow | null;
}
