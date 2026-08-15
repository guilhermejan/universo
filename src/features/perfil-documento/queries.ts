import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { PerfilDocumentalRow, TipoDocumentoRow } from "@/lib/types/database.types";
import type { VinculoPerfilDocumento } from "@/features/perfil-documento/types";

export async function listPerfisDocumentais(contratanteId: number): Promise<PerfilDocumentalRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("perfis_documentais")
    .select("*")
    .eq("empresa_contratante_id", contratanteId)
    .order("nome");

  if (error) throw error;
  return (data ?? []) as PerfilDocumentalRow[];
}

export async function listVinculosDoPerfil(perfilId: number): Promise<VinculoPerfilDocumento[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("perfil_documento")
    .select("*, tipos_documento(codigo, descricao)")
    .eq("perfil_documental_id", perfilId);

  if (error) throw error;

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const tipo = row.tipos_documento as { codigo: string; descricao: string } | null;
    return {
      perfil_documental_id: row.perfil_documental_id,
      tipo_documento_id: row.tipo_documento_id,
      obrigatorio: row.obrigatorio,
      bloqueia_acesso: row.bloqueia_acesso,
      dias_tolerancia: row.dias_tolerancia,
      ativo: row.ativo,
      tipo_documento_codigo: tipo?.codigo ?? "",
      tipo_documento_descricao: tipo?.descricao ?? "(documento removido)",
    } as VinculoPerfilDocumento;
  }).sort((a, b) => a.tipo_documento_descricao.localeCompare(b.tipo_documento_descricao));
}

// Tipos ativos do contratante que ainda não estão vinculados a esse perfil —
// alimenta o Select do diálogo "Adicionar documento".
export async function listTiposDisponiveisParaPerfil(
  contratanteId: number,
  perfilId: number
): Promise<TipoDocumentoRow[]> {
  const admin = createAdminClient();

  const { data: vinculados, error: erroVinculados } = await admin
    .from("perfil_documento")
    .select("tipo_documento_id")
    .eq("perfil_documental_id", perfilId);
  if (erroVinculados) throw erroVinculados;

  const idsVinculados = (vinculados ?? []).map((v: { tipo_documento_id: number }) => v.tipo_documento_id);

  let query = admin
    .from("tipos_documento")
    .select("*")
    .eq("empresa_contratante_id", contratanteId)
    .eq("ativo", true)
    .order("descricao");

  if (idsVinculados.length > 0) {
    query = query.not("id", "in", `(${idsVinculados.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as TipoDocumentoRow[];
}
