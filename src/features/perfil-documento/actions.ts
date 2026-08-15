"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUsuario } from "@/lib/auth/session";
import { requireRole, PermissaoNegadaError } from "@/lib/auth/permissions";
import { getContratanteContext } from "@/features/documentos/scope";

export type PerfilDocumentoActionState = { error?: string } | null;

const PAPEIS_QUE_GERENCIAM = ["admin_plataforma", "admin_contratante", "gestor_contrato"] as const;

async function checarPermissaoDoPerfil(perfilId: number) {
  const usuario = await requireUsuario();
  requireRole(usuario, [...PAPEIS_QUE_GERENCIAM]);

  const admin = createAdminClient();
  const { data: perfil, error } = await admin
    .from("perfis_documentais")
    .select("empresa_contratante_id")
    .eq("id", perfilId)
    .maybeSingle();
  if (error) throw error;
  if (!perfil) throw new PermissaoNegadaError("Perfil documental não encontrado.");

  const context = await getContratanteContext(usuario);
  if (context.contratanteFixo && context.contratanteFixo !== perfil.empresa_contratante_id) {
    throw new PermissaoNegadaError("Você não tem permissão para gerenciar esse perfil.");
  }
}

export async function addDocumentoAoPerfilAction(
  perfilId: number,
  tipoDocumentoId: number,
  bloqueiaAcesso: boolean,
  diasTolerancia: number
): Promise<PerfilDocumentoActionState> {
  try {
    await checarPermissaoDoPerfil(perfilId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("perfil_documento").insert({
    perfil_documental_id: perfilId,
    tipo_documento_id: tipoDocumentoId,
    obrigatorio: true,
    bloqueia_acesso: bloqueiaAcesso,
    dias_tolerancia: diasTolerancia,
  });

  if (error) {
    return { error: "Não foi possível vincular o documento. Tente novamente." };
  }

  revalidatePath("/documentos/perfis");
  return null;
}

export async function removeDocumentoDoPerfilAction(
  perfilId: number,
  tipoDocumentoId: number
): Promise<PerfilDocumentoActionState> {
  try {
    await checarPermissaoDoPerfil(perfilId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("perfil_documento")
    .delete()
    .eq("perfil_documental_id", perfilId)
    .eq("tipo_documento_id", tipoDocumentoId);

  if (error) {
    return { error: "Não foi possível remover o documento do perfil. Tente novamente." };
  }

  revalidatePath("/documentos/perfis");
  return null;
}

export async function updateVinculoAction(
  perfilId: number,
  tipoDocumentoId: number,
  changes: { bloqueia_acesso?: boolean; dias_tolerancia?: number; ativo?: boolean }
): Promise<PerfilDocumentoActionState> {
  try {
    await checarPermissaoDoPerfil(perfilId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("perfil_documento")
    .update(changes)
    .eq("perfil_documental_id", perfilId)
    .eq("tipo_documento_id", tipoDocumentoId);

  if (error) {
    return { error: "Não foi possível atualizar o vínculo. Tente novamente." };
  }

  revalidatePath("/documentos/perfis");
  return null;
}
