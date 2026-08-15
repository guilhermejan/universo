"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUsuario } from "@/lib/auth/session";
import { requireRole, assertEmpresaVisivel, PermissaoNegadaError } from "@/lib/auth/permissions";
import { getEmpresaFormContext } from "@/features/empresas/scope";
import {
  empresaCreateSchema,
  empresaUpdateSchema,
  type EmpresaCreateInput,
  type EmpresaUpdateInput,
} from "@/features/empresas/schema";

export type EmpresaActionState = { error?: string } | null;

const PAPEIS_QUE_GERENCIAM_EMPRESAS = [
  "admin_plataforma",
  "admin_contratante",
  "gestor_contrato",
] as const;

function mensagemErroSupabase(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    return "Já existe uma empresa cadastrada com esse CNPJ.";
  }
  return "Não foi possível salvar a empresa. Tente novamente.";
}

// Campos opcionais chegam do formulário como "" quando vazios (zod não
// transforma mais "" em null, ver features/empresas/schema.ts) — aqui, na
// borda com o banco, "" vira null pra bater com as colunas nullable.
function nullIfEmpty(value: string | undefined): string | null {
  return value && value.trim() !== "" ? value.trim() : null;
}

function camposComuns(data: EmpresaCreateInput | EmpresaUpdateInput) {
  return {
    razao_social: data.razao_social,
    nome_fantasia: data.nome_fantasia,
    cnpj: data.cnpj,
    inscricao_municipal: nullIfEmpty(data.inscricao_municipal),
    inscricao_estadual: nullIfEmpty(data.inscricao_estadual),
    endereco: nullIfEmpty(data.endereco),
    numero: nullIfEmpty(data.numero),
    complemento: nullIfEmpty(data.complemento),
    bairro: nullIfEmpty(data.bairro),
    cidade: nullIfEmpty(data.cidade),
    estado: nullIfEmpty(data.estado),
    cep: nullIfEmpty(data.cep),
    responsavel_nome: nullIfEmpty(data.responsavel_nome),
    responsavel_email: nullIfEmpty(data.responsavel_email),
    responsavel_telefone: nullIfEmpty(data.responsavel_telefone),
  };
}

export async function createEmpresaAction(
  input: EmpresaCreateInput
): Promise<EmpresaActionState> {
  const usuario = await requireUsuario();

  try {
    requireRole(usuario, [...PAPEIS_QUE_GERENCIAM_EMPRESAS]);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const parsed = empresaCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const context = await getEmpresaFormContext(usuario);
  if (!context.tiposPermitidos.includes(data.tipo)) {
    return { error: "Você não tem permissão para criar esse tipo de empresa." };
  }

  let empresaPaiId: number | null = data.empresa_pai_id ?? null;

  if (data.tipo === "proprietaria_saas") {
    if (context.universoId) {
      return { error: "Já existe uma UNIVERSO cadastrada." };
    }
    empresaPaiId = null;
  } else if (data.tipo === "contratante") {
    if (!context.universoId) {
      return { error: "Cadastre a UNIVERSO antes de criar contratantes." };
    }
    empresaPaiId = context.universoId;
  } else if (data.tipo === "terceirizada") {
    if (context.empresaPaiFixa) {
      empresaPaiId = context.empresaPaiFixa;
    } else if (!context.contratantesDisponiveis.some((c) => c.id === empresaPaiId)) {
      return { error: "Selecione uma contratante válida." };
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.from("empresas").insert({
    tipo: data.tipo,
    empresa_pai_id: empresaPaiId,
    ...camposComuns(data),
    grupo_id: null,
    perfil_documental_id: null,
  });

  if (error) {
    return { error: mensagemErroSupabase(error) };
  }

  revalidatePath("/empresas");
  redirect("/empresas");
}

export async function updateEmpresaAction(
  empresaId: number,
  input: EmpresaUpdateInput
): Promise<EmpresaActionState> {
  const usuario = await requireUsuario();

  try {
    requireRole(usuario, [...PAPEIS_QUE_GERENCIAM_EMPRESAS]);
    await assertEmpresaVisivel(usuario, empresaId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const parsed = empresaUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;

  const admin = createAdminClient();
  const { error } = await admin
    .from("empresas")
    .update(camposComuns(data))
    .eq("id", empresaId);

  if (error) {
    return { error: mensagemErroSupabase(error) };
  }

  revalidatePath("/empresas");
  redirect("/empresas");
}

export async function setEmpresaAtivoAction(
  empresaId: number,
  ativo: boolean
): Promise<EmpresaActionState> {
  const usuario = await requireUsuario();

  try {
    requireRole(usuario, [...PAPEIS_QUE_GERENCIAM_EMPRESAS]);
    await assertEmpresaVisivel(usuario, empresaId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) return { error: err.message };
    throw err;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("empresas").update({ ativo }).eq("id", empresaId);
  if (error) {
    return { error: mensagemErroSupabase(error) };
  }

  revalidatePath("/empresas");
  return null;
}
