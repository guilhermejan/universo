"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUsuario } from "@/lib/auth/session";
import { requireRole, PermissaoNegadaError } from "@/lib/auth/permissions";
import { getContratanteContext } from "@/features/documentos/scope";
import { grupoSchema, type GrupoInput } from "@/features/grupos/schema";

export type GrupoActionState = { error?: string } | null;

const PAPEIS_QUE_GERENCIAM = ["admin_plataforma", "admin_contratante", "gestor_contrato"] as const;

async function checarPermissao(contratanteId: number) {
  const usuario = await requireUsuario();
  requireRole(usuario, [...PAPEIS_QUE_GERENCIAM]);

  const context = await getContratanteContext(usuario);
  if (context.contratanteFixo && context.contratanteFixo !== contratanteId) {
    throw new PermissaoNegadaError("Você não tem permissão para gerenciar grupos dessa contratante.");
  }
}

function camposComuns(data: GrupoInput) {
  return {
    codigo: data.codigo && data.codigo.trim() !== "" ? data.codigo.trim() : null,
    nome: data.nome,
    ativo: data.ativo,
  };
}

export async function createGrupoAction(
  contratanteId: number,
  input: GrupoInput
): Promise<GrupoActionState> {
  try {
    await checarPermissao(contratanteId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const parsed = grupoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("grupos_terceiro").insert({
    empresa_contratante_id: contratanteId,
    ...camposComuns(parsed.data),
  });

  if (error) {
    return { error: "Não foi possível salvar o grupo. Tente novamente." };
  }

  revalidatePath("/grupos");
  redirect(`/grupos?contratante_id=${contratanteId}`);
}

export async function updateGrupoAction(
  grupoId: number,
  contratanteId: number,
  input: GrupoInput
): Promise<GrupoActionState> {
  try {
    await checarPermissao(contratanteId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const parsed = grupoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("grupos_terceiro")
    .update(camposComuns(parsed.data))
    .eq("id", grupoId);

  if (error) {
    return { error: "Não foi possível salvar o grupo. Tente novamente." };
  }

  revalidatePath("/grupos");
  redirect(`/grupos?contratante_id=${contratanteId}`);
}

export async function setGrupoAtivoAction(
  grupoId: number,
  contratanteId: number,
  ativo: boolean
): Promise<GrupoActionState> {
  try {
    await checarPermissao(contratanteId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("grupos_terceiro").update({ ativo }).eq("id", grupoId);
  if (error) {
    return { error: "Não foi possível atualizar o grupo. Tente novamente." };
  }

  revalidatePath("/grupos");
  return null;
}
