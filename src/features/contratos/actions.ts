"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUsuario } from "@/lib/auth/session";
import { requireRole, PermissaoNegadaError } from "@/lib/auth/permissions";
import { getContratanteContext } from "@/features/documentos/scope";
import { contratoSchema, type ContratoInput } from "@/features/contratos/schema";

export type ContratoActionState = { error?: string } | null;

const PAPEIS_QUE_GERENCIAM = ["admin_plataforma", "admin_contratante", "gestor_contrato"] as const;

async function checarPermissao(contratanteId: number) {
  const usuario = await requireUsuario();
  requireRole(usuario, [...PAPEIS_QUE_GERENCIAM]);

  const context = await getContratanteContext(usuario);
  if (context.contratanteFixo && context.contratanteFixo !== contratanteId) {
    throw new PermissaoNegadaError("Você não tem permissão para gerenciar contratos dessa contratante.");
  }
}

// A terceirizada precisa ser filha da contratante — sem isso dá pra criar
// um contrato ligando empresas de hierarquias diferentes.
async function validarTerceirizada(contratanteId: number, terceirizadaId: number) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("empresas")
    .select("empresa_pai_id")
    .eq("id", terceirizadaId)
    .eq("tipo", "terceirizada")
    .maybeSingle();

  if (error) throw error;
  return data?.empresa_pai_id === contratanteId;
}

function camposComuns(data: ContratoInput) {
  return {
    empresa_terceirizada_id: data.empresa_terceirizada_id,
    gestor_contrato_usuario_id:
      data.gestor_contrato_usuario_id && data.gestor_contrato_usuario_id !== ""
        ? data.gestor_contrato_usuario_id
        : null,
    numero_contrato:
      data.numero_contrato && data.numero_contrato.trim() !== "" ? data.numero_contrato.trim() : null,
    data_inicio: data.data_inicio && data.data_inicio !== "" ? data.data_inicio : null,
    data_fim: data.data_fim && data.data_fim !== "" ? data.data_fim : null,
    status: data.status,
  };
}

export async function createContratoAction(
  contratanteId: number,
  input: ContratoInput
): Promise<ContratoActionState> {
  try {
    await checarPermissao(contratanteId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const parsed = contratoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  if (!(await validarTerceirizada(contratanteId, data.empresa_terceirizada_id))) {
    return { error: "Selecione uma terceirizada válida dessa contratante." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("contratos").insert({
    empresa_contratante_id: contratanteId,
    ...camposComuns(data),
  });

  if (error) {
    return { error: "Não foi possível salvar o contrato. Tente novamente." };
  }

  revalidatePath("/contratos");
  redirect(`/contratos?contratante_id=${contratanteId}`);
}

export async function updateContratoAction(
  contratoId: number,
  contratanteId: number,
  input: ContratoInput
): Promise<ContratoActionState> {
  try {
    await checarPermissao(contratanteId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const parsed = contratoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  if (!(await validarTerceirizada(contratanteId, data.empresa_terceirizada_id))) {
    return { error: "Selecione uma terceirizada válida dessa contratante." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("contratos")
    .update(camposComuns(data))
    .eq("id", contratoId);

  if (error) {
    return { error: "Não foi possível salvar o contrato. Tente novamente." };
  }

  revalidatePath("/contratos");
  redirect(`/contratos?contratante_id=${contratanteId}`);
}
