"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUsuario } from "@/lib/auth/session";
import { requireRole, PermissaoNegadaError } from "@/lib/auth/permissions";
import { getTerceirizadaContext } from "@/features/funcionarios/scope";
import { funcionarioSchema, type FuncionarioInput } from "@/features/funcionarios/schema";

export type FuncionarioActionState = { error?: string } | null;

// Inclui 'terceiro': é o próprio funcionário/staff dela — diferente de
// tipos_documento/perfis, que são configuração da contratante. O escopo
// (terceirizadaFixa) já trava o terceiro na própria empresa.
const PAPEIS_QUE_GERENCIAM = [
  "admin_plataforma",
  "admin_contratante",
  "gestor_contrato",
  "terceiro",
] as const;

async function checarPermissao(terceirizadaId: number) {
  const usuario = await requireUsuario();
  requireRole(usuario, [...PAPEIS_QUE_GERENCIAM]);

  const context = await getTerceirizadaContext(usuario);
  if (context.terceirizadaFixa && context.terceirizadaFixa !== terceirizadaId) {
    throw new PermissaoNegadaError("Você não tem permissão para gerenciar funcionários dessa empresa.");
  }
  if (
    !context.terceirizadaFixa &&
    !context.terceirizadasDisponiveis.some((t) => t.id === terceirizadaId)
  ) {
    throw new PermissaoNegadaError("Você não tem permissão para gerenciar funcionários dessa empresa.");
  }
}

function mensagemErroSupabase(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    return "Já existe um funcionário cadastrado com esse CPF nessa empresa.";
  }
  return "Não foi possível salvar o funcionário. Tente novamente.";
}

function camposComuns(data: FuncionarioInput) {
  return {
    nome: data.nome,
    cpf: data.cpf && data.cpf.trim() !== "" ? data.cpf.trim() : null,
    numero_inscricao:
      data.numero_inscricao && data.numero_inscricao.trim() !== "" ? data.numero_inscricao.trim() : null,
    cargo: data.cargo && data.cargo.trim() !== "" ? data.cargo.trim() : null,
    situacao: data.situacao,
  };
}

export async function createFuncionarioAction(
  terceirizadaId: number,
  input: FuncionarioInput
): Promise<FuncionarioActionState> {
  try {
    await checarPermissao(terceirizadaId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const parsed = funcionarioSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("funcionarios").insert({
    empresa_terceirizada_id: terceirizadaId,
    ...camposComuns(parsed.data),
  });

  if (error) {
    return { error: mensagemErroSupabase(error) };
  }

  revalidatePath("/funcionarios");
  redirect(`/funcionarios?terceirizada_id=${terceirizadaId}`);
}

export async function updateFuncionarioAction(
  funcionarioId: number,
  terceirizadaId: number,
  input: FuncionarioInput
): Promise<FuncionarioActionState> {
  try {
    await checarPermissao(terceirizadaId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const parsed = funcionarioSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("funcionarios")
    .update(camposComuns(parsed.data))
    .eq("id", funcionarioId);

  if (error) {
    return { error: mensagemErroSupabase(error) };
  }

  revalidatePath("/funcionarios");
  redirect(`/funcionarios?terceirizada_id=${terceirizadaId}`);
}

export async function setFuncionarioSituacaoAction(
  funcionarioId: number,
  terceirizadaId: number,
  situacao: "ativo" | "desligado"
): Promise<FuncionarioActionState> {
  try {
    await checarPermissao(terceirizadaId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("funcionarios").update({ situacao }).eq("id", funcionarioId);
  if (error) {
    return { error: "Não foi possível atualizar o funcionário. Tente novamente." };
  }

  revalidatePath("/funcionarios");
  return null;
}
