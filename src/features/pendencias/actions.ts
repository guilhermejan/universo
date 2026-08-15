"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUsuario } from "@/lib/auth/session";
import { getVisibleEmpresaIds } from "@/lib/auth/permissions";
import { uploadAnexoDocumento } from "@/lib/supabase/storage";

export type RegularizarPendenciasState = { error?: string } | null;

export async function regularizarPendenciasAction(
  formData: FormData
): Promise<RegularizarPendenciasState> {
  const usuario = await requireUsuario();

  let itemIds: number[];
  try {
    const raw = String(formData.get("itemIds") ?? "[]");
    itemIds = (JSON.parse(raw) as unknown[]).map(Number).filter((n) => Number.isInteger(n));
  } catch {
    return { error: "Seleção inválida." };
  }
  if (itemIds.length === 0) {
    return { error: "Selecione ao menos uma pendência." };
  }

  const observacaoRaw = String(formData.get("observacao") ?? "").trim();
  const observacao = observacaoRaw !== "" ? observacaoRaw : null;
  const arquivos = formData
    .getAll("arquivos")
    .filter((entrada): entrada is File => entrada instanceof File && entrada.size > 0);

  const admin = createAdminClient();

  const { data: itens, error: erroItens } = await admin
    .from("documentos_entregues")
    .select("id, empresa_terceirizada_id")
    .in("id", itemIds);
  if (erroItens) {
    return { error: "Não foi possível localizar as pendências selecionadas." };
  }

  const visiveis = await getVisibleEmpresaIds(usuario);
  const foraDoEscopo = (itens as { id: number; empresa_terceirizada_id: number }[] | null)?.some(
    (item) => visiveis !== "all" && !visiveis.includes(item.empresa_terceirizada_id)
  );
  if (!itens || itens.length !== itemIds.length || foraDoEscopo) {
    return { error: "Você não tem permissão sobre uma das pendências selecionadas." };
  }

  const hoje = new Date().toISOString().slice(0, 10);

  const { error: erroUpdate } = await admin
    .from("documentos_entregues")
    .update({ data_entrega: hoje, observacao, status: "entregue_a_conferir" })
    .in("id", itemIds);
  if (erroUpdate) {
    return { error: "Não foi possível salvar. Tente novamente." };
  }

  if (arquivos.length > 0) {
    // Sobe cada arquivo uma vez só (pasta com o primeiro id selecionado) e
    // reaproveita o path pra todos os itens marcados — o mesmo anexo pode
    // resolver várias pendências no mesmo lançamento (ex: 1 PDF só cobrindo
    // o ASO de vários funcionários).
    const anexosSubidos: { path: string; nomeArquivo: string }[] = [];
    for (const arquivo of arquivos) {
      const resultado = await uploadAnexoDocumento(itemIds[0], arquivo);
      anexosSubidos.push(resultado);
    }

    const linhasAnexos = itemIds.flatMap((itemId) =>
      anexosSubidos.map((anexo) => ({
        documento_entregue_id: itemId,
        arquivo_url: anexo.path,
        nome_arquivo: anexo.nomeArquivo,
      }))
    );

    const { error: erroAnexos } = await admin.from("documentos_entregues_anexos").insert(linhasAnexos);
    if (erroAnexos) {
      return { error: "Pendências salvas, mas houve falha ao anexar os arquivos." };
    }
  }

  revalidatePath("/documentos");
  return null;
}
