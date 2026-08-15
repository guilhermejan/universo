import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { TipoDocumentoRow } from "@/lib/types/database.types";

export async function listTiposDocumento(contratanteId: number): Promise<TipoDocumentoRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tipos_documento")
    .select("*")
    .eq("empresa_contratante_id", contratanteId)
    .order("descricao");

  if (error) throw error;
  return (data ?? []) as TipoDocumentoRow[];
}

export async function getTipoDocumentoById(id: number): Promise<TipoDocumentoRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("tipos_documento").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as TipoDocumentoRow | null;
}
