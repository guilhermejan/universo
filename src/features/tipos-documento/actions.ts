"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUsuario } from "@/lib/auth/session";
import { requireRole, PermissaoNegadaError } from "@/lib/auth/permissions";
import { getContratanteContext } from "@/features/documentos/scope";
import { tipoDocumentoSchema, type TipoDocumentoInput } from "@/features/tipos-documento/schema";
import type { PeriodicidadeDocumento } from "@/lib/types/database.types";

export type TipoDocumentoActionState = { error?: string } | null;

const PAPEIS_QUE_GERENCIAM = ["admin_plataforma", "admin_contratante", "gestor_contrato"] as const;

function mensagemErroSupabase(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    return "Já existe um documento cadastrado com esse código.";
  }
  return "Não foi possível salvar o tipo de documento. Tente novamente.";
}

// Código auto-incremental por contratante quando o usuário deixa em branco
// (spec: "Código (auto ou manual)"). Só funciona de forma previsível pra
// códigos puramente numéricos, que é o formato usado (ex: "0007").
async function proximoCodigo(contratanteId: number): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tipos_documento")
    .select("codigo")
    .eq("empresa_contratante_id", contratanteId)
    .order("codigo", { ascending: false })
    .limit(1);

  if (error) throw error;

  const ultimo = (data as { codigo: string }[] | null)?.[0]?.codigo;
  const numero = ultimo && /^\d+$/.test(ultimo) ? Number(ultimo) + 1 : 1;
  return String(numero).padStart(4, "0");
}

function camposComuns(data: TipoDocumentoInput) {
  return {
    descricao: data.descricao,
    periodicidade: data.periodicidade as PeriodicidadeDocumento,
    frequencia_meses:
      data.periodicidade === "periodico_a_partir_entrega" ? (data.frequencia_meses ?? null) : null,
    formato_apresentacao:
      data.formato_apresentacao && data.formato_apresentacao.trim() !== ""
        ? data.formato_apresentacao.trim()
        : null,
    funcao: data.funcao,
    permitir_editar_entrega: data.permitir_editar_entrega,
    envia_email: data.envia_email,
    anexo_obrigatorio: data.anexo_obrigatorio,
    permite_isencao: data.permite_isencao,
    contabilizar_pontualidade: data.contabilizar_pontualidade,
    ativo: data.ativo,
  };
}

async function checarPermissao() {
  const usuario = await requireUsuario();
  requireRole(usuario, [...PAPEIS_QUE_GERENCIAM]);
  return usuario;
}

export async function createTipoDocumentoAction(
  contratanteId: number,
  input: TipoDocumentoInput
): Promise<TipoDocumentoActionState> {
  let usuario;
  try {
    usuario = await checarPermissao();
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const context = await getContratanteContext(usuario);
  if (context.contratanteFixo && context.contratanteFixo !== contratanteId) {
    return { error: "Você não tem permissão para gerenciar documentos dessa contratante." };
  }

  const parsed = tipoDocumentoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const codigo = data.codigo && data.codigo.trim() !== "" ? data.codigo.trim() : await proximoCodigo(contratanteId);

  const admin = createAdminClient();
  const { error } = await admin.from("tipos_documento").insert({
    empresa_contratante_id: contratanteId,
    codigo,
    ...camposComuns(data),
  });

  if (error) {
    return { error: mensagemErroSupabase(error) };
  }

  revalidatePath("/documentos/tipos");
  redirect(`/documentos/tipos?contratante_id=${contratanteId}`);
}

export async function updateTipoDocumentoAction(
  tipoId: number,
  contratanteId: number,
  input: TipoDocumentoInput
): Promise<TipoDocumentoActionState> {
  let usuario;
  try {
    usuario = await checarPermissao();
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const context = await getContratanteContext(usuario);
  if (context.contratanteFixo && context.contratanteFixo !== contratanteId) {
    return { error: "Você não tem permissão para gerenciar documentos dessa contratante." };
  }

  const parsed = tipoDocumentoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const admin = createAdminClient();
  const { error } = await admin
    .from("tipos_documento")
    .update({
      codigo: data.codigo && data.codigo.trim() !== "" ? data.codigo.trim() : undefined,
      ...camposComuns(data),
    })
    .eq("id", tipoId);

  if (error) {
    return { error: mensagemErroSupabase(error) };
  }

  revalidatePath("/documentos/tipos");
  redirect(`/documentos/tipos?contratante_id=${contratanteId}`);
}

export async function setTipoDocumentoAtivoAction(
  tipoId: number,
  ativo: boolean
): Promise<TipoDocumentoActionState> {
  try {
    await checarPermissao();
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("tipos_documento").update({ ativo }).eq("id", tipoId);
  if (error) {
    return { error: mensagemErroSupabase(error) };
  }

  revalidatePath("/documentos/tipos");
  return null;
}
