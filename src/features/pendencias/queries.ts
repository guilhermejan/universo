import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getVisibleEmpresaIds } from "@/lib/auth/permissions";
import type { UsuarioProfile } from "@/lib/auth/session";
import type { PendenciaItem } from "@/features/pendencias/types";

const STATUS_PENDENTES = ["a_vencer", "vencido", "faltando"] as const;

type DocumentoEntregueJoined = {
  id: number;
  empresa_terceirizada_id: number;
  funcionario_id: number | null;
  competencia: string | null;
  data_validade: string | null;
  status: string;
  tipos_documento: {
    id: number;
    codigo: string;
    descricao: string;
    periodicidade: PendenciaItem["periodicidade"];
    frequencia_meses: number | null;
  } | null;
  empresas: { nome_fantasia: string } | null;
  funcionarios: { nome: string } | null;
};

// Busca tudo que o usuário enxerga uma vez só (igual ao padrão de
// features/empresas/queries.ts): a página filtra em memória por
// empresa/documento/competência a partir desse conjunto único.
export async function listPendencias(usuario: UsuarioProfile): Promise<PendenciaItem[]> {
  const visiveis = await getVisibleEmpresaIds(usuario);
  if (visiveis !== "all" && visiveis.length === 0) return [];

  const admin = createAdminClient();
  let query = admin
    .from("documentos_entregues")
    .select(
      "id, empresa_terceirizada_id, funcionario_id, competencia, data_validade, status, tipos_documento(id, codigo, descricao, periodicidade, frequencia_meses), empresas(nome_fantasia), funcionarios(nome)"
    )
    .in("status", STATUS_PENDENTES)
    .order("data_validade", { ascending: true, nullsFirst: true });

  if (visiveis !== "all") {
    query = query.in("empresa_terceirizada_id", visiveis);
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as DocumentoEntregueJoined[])
    .filter((row) => row.tipos_documento && row.empresas)
    .map((row) => ({
      id: row.id,
      tipo: row.funcionario_id ? "funcionario" : "empresa",
      nome: row.funcionario_id ? (row.funcionarios?.nome ?? "—") : (row.empresas?.nome_fantasia ?? "—"),
      empresaId: row.empresa_terceirizada_id,
      empresaNome: row.empresas?.nome_fantasia ?? "—",
      tipoDocumentoId: row.tipos_documento!.id,
      tipoDocumentoCodigo: row.tipos_documento!.codigo,
      tipoDocumentoDescricao: row.tipos_documento!.descricao,
      periodicidade: row.tipos_documento!.periodicidade,
      frequenciaMeses: row.tipos_documento!.frequencia_meses,
      competencia: row.competencia,
      dataValidade: row.data_validade,
      status: row.status as PendenciaItem["status"],
    }));
}

export async function listTerceirizadasParaFiltro(
  usuario: UsuarioProfile
): Promise<{ id: number; nome_fantasia: string }[]> {
  const visiveis = await getVisibleEmpresaIds(usuario);
  const admin = createAdminClient();

  let query = admin
    .from("empresas")
    .select("id, nome_fantasia")
    .eq("tipo", "terceirizada")
    .order("nome_fantasia");

  if (visiveis !== "all") {
    query = query.in("id", visiveis);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as { id: number; nome_fantasia: string }[];
}
