"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUsuario } from "@/lib/auth/session";
import { requireRole, PermissaoNegadaError } from "@/lib/auth/permissions";
import { getContratanteContext } from "@/features/documentos/scope";
import {
  perfilParametrizacaoSchema,
  type PerfilParametrizacaoInput,
} from "@/features/parametrizacoes/schema";
import type { TipoEntidadeParametrizacao } from "@/lib/types/database.types";

export type PerfilParametrizacaoActionState = { error?: string } | null;

const PAPEIS_QUE_GERENCIAM = ["admin_plataforma", "admin_contratante", "gestor_contrato"] as const;

async function checarPermissao(contratanteId: number) {
  const usuario = await requireUsuario();
  requireRole(usuario, [...PAPEIS_QUE_GERENCIAM]);

  const context = await getContratanteContext(usuario);
  if (context.contratanteFixo && context.contratanteFixo !== contratanteId) {
    throw new PermissaoNegadaError("Você não tem permissão para gerenciar parametrizações dessa contratante.");
  }
}

// Código auto-incremental por (contratante, parâmetro, tipo de entidade) —
// mesmo padrão de features/tipos-documento/actions.ts.
async function proximoCodigo(
  parametroId: number,
  contratanteId: number,
  tipoEntidade: TipoEntidadeParametrizacao
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("parametrizacao_perfis")
    .select("codigo")
    .eq("parametro_id", parametroId)
    .eq("empresa_contratante_id", contratanteId)
    .eq("tipo_entidade", tipoEntidade)
    .order("codigo", { ascending: false })
    .limit(1);

  if (error) throw error;

  const ultimo = (data as { codigo: string }[] | null)?.[0]?.codigo;
  const numero = ultimo && /^\d+$/.test(ultimo) ? Number(ultimo) + 1 : 1;
  return String(numero).padStart(5, "0");
}

function camposComuns(data: PerfilParametrizacaoInput) {
  return {
    tipo_entidade: data.tipo_entidade,
    descricao: data.descricao,
    nivel_aprovacao: data.nivel_aprovacao,
    modo_cadastro: data.modo_cadastro && data.modo_cadastro.trim() !== "" ? data.modo_cadastro.trim() : null,
  };
}

export async function createPerfilParametrizacaoAction(
  parametroId: number,
  contratanteId: number,
  input: PerfilParametrizacaoInput
): Promise<PerfilParametrizacaoActionState> {
  try {
    await checarPermissao(contratanteId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const parsed = perfilParametrizacaoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const codigo =
    data.codigo && data.codigo.trim() !== ""
      ? data.codigo.trim()
      : await proximoCodigo(parametroId, contratanteId, data.tipo_entidade);

  const admin = createAdminClient();
  const { error } = await admin.from("parametrizacao_perfis").insert({
    parametro_id: parametroId,
    empresa_contratante_id: contratanteId,
    codigo,
    ...camposComuns(data),
  });

  if (error) {
    return { error: "Não foi possível salvar o perfil de parametrização. Tente novamente." };
  }

  revalidatePath("/parametrizacoes");
  return null;
}

export async function updatePerfilParametrizacaoAction(
  perfilId: number,
  contratanteId: number,
  input: PerfilParametrizacaoInput
): Promise<PerfilParametrizacaoActionState> {
  try {
    await checarPermissao(contratanteId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const parsed = perfilParametrizacaoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const admin = createAdminClient();
  const { error } = await admin
    .from("parametrizacao_perfis")
    .update({
      codigo: data.codigo && data.codigo.trim() !== "" ? data.codigo.trim() : undefined,
      ...camposComuns(data),
    })
    .eq("id", perfilId);

  if (error) {
    return { error: "Não foi possível salvar o perfil de parametrização. Tente novamente." };
  }

  revalidatePath("/parametrizacoes");
  return null;
}

export async function deletePerfilParametrizacaoAction(
  perfilId: number,
  contratanteId: number
): Promise<PerfilParametrizacaoActionState> {
  try {
    await checarPermissao(contratanteId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("parametrizacao_perfis").delete().eq("id", perfilId);
  if (error) {
    return { error: "Não foi possível remover o perfil de parametrização. Tente novamente." };
  }

  revalidatePath("/parametrizacoes");
  return null;
}
