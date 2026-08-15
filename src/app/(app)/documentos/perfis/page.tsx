import { redirect } from "next/navigation";

import { requireUsuario } from "@/lib/auth/session";
import { getContratanteContext, resolveContratanteId } from "@/features/documentos/scope";
import {
  listPerfisDocumentais,
  listVinculosDoPerfil,
  listTiposDisponiveisParaPerfil,
} from "@/features/perfil-documento/queries";
import { ContratanteSelector } from "@/features/documentos/components/ContratanteSelector";
import { PerfilSelector } from "@/features/perfil-documento/components/PerfilSelector";
import { PerfilDocumentosTable } from "@/features/perfil-documento/components/PerfilDocumentosTable";
import { AdicionarDocumentoDialog } from "@/features/perfil-documento/components/AdicionarDocumentoDialog";

export default async function PerfisDocumentaisPage({
  searchParams,
}: {
  searchParams: Promise<{ contratante_id?: string; perfil_id?: string }>;
}) {
  const usuario = await requireUsuario();
  if (usuario.papel === "terceiro") {
    redirect("/documentos");
  }

  const params = await searchParams;
  const context = await getContratanteContext(usuario);
  const contratanteId = resolveContratanteId(context, params.contratante_id);

  const perfis = contratanteId ? await listPerfisDocumentais(contratanteId) : [];

  const perfilIdParam = params.perfil_id ? Number(params.perfil_id) : undefined;
  const perfilId =
    perfilIdParam && perfis.some((p) => p.id === perfilIdParam)
      ? perfilIdParam
      : (perfis[0]?.id ?? null);

  const [vinculos, tiposDisponiveis] =
    contratanteId && perfilId
      ? await Promise.all([
          listVinculosDoPerfil(perfilId),
          listTiposDisponiveisParaPerfil(contratanteId, perfilId),
        ])
      : [[], []];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-universo-black">
          Perfis de documento
        </h1>
        <p className="text-sm text-muted-foreground">
          Define quais documentos cada perfil documental exige e como o vencimento bloqueia acesso.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <ContratanteSelector
            contratanteFixoNome={context.contratanteFixoNome}
            contratantesDisponiveis={context.contratantesDisponiveis}
            contratanteSelecionadoId={contratanteId}
          />
          {contratanteId && <PerfilSelector perfis={perfis} perfilSelecionadoId={perfilId} />}
        </div>

        {perfilId && (
          <AdicionarDocumentoDialog perfilId={perfilId} tiposDisponiveis={tiposDisponiveis} />
        )}
      </div>

      {!contratanteId ? (
        <p className="rounded-lg border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          Selecione uma contratante pra ver os perfis documentais dela.
        </p>
      ) : perfis.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          Essa contratante ainda não tem nenhum perfil documental cadastrado.
        </p>
      ) : (
        perfilId && <PerfilDocumentosTable perfilId={perfilId} vinculos={vinculos} />
      )}
    </div>
  );
}
