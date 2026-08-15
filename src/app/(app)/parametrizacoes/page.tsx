import { redirect } from "next/navigation";

import { requireUsuario } from "@/lib/auth/session";
import { getContratanteContext, resolveContratanteId } from "@/features/documentos/scope";
import {
  listAgrupamentos,
  listParametros,
  listPerfisParametrizacao,
} from "@/features/parametrizacoes/queries";
import { AgrupamentoParametroFilters } from "@/features/parametrizacoes/components/AgrupamentoParametroFilters";
import { PerfilParametrizacaoTable } from "@/features/parametrizacoes/components/PerfilParametrizacaoTable";
import { PerfilParametrizacaoDialog } from "@/features/parametrizacoes/components/PerfilParametrizacaoDialog";
import { ContratanteSelector } from "@/features/documentos/components/ContratanteSelector";

export default async function ParametrizacoesPage({
  searchParams,
}: {
  searchParams: Promise<{
    contratante_id?: string;
    agrupamento_id?: string;
    parametro_id?: string;
  }>;
}) {
  const usuario = await requireUsuario();
  if (usuario.papel === "terceiro") {
    redirect("/empresas");
  }

  const params = await searchParams;
  const context = await getContratanteContext(usuario);
  const contratanteId = resolveContratanteId(context, params.contratante_id);

  const agrupamentos = await listAgrupamentos();
  const agrupamentoIdParam = params.agrupamento_id ? Number(params.agrupamento_id) : undefined;
  const agrupamentoId =
    agrupamentoIdParam && agrupamentos.some((a) => a.id === agrupamentoIdParam)
      ? agrupamentoIdParam
      : (agrupamentos[0]?.id ?? null);

  const parametros = agrupamentoId ? await listParametros(agrupamentoId) : [];
  const parametroIdParam = params.parametro_id ? Number(params.parametro_id) : undefined;
  const parametroId =
    parametroIdParam && parametros.some((p) => p.id === parametroIdParam)
      ? parametroIdParam
      : (parametros[0]?.id ?? null);

  const perfis =
    contratanteId && parametroId ? await listPerfisParametrizacao(parametroId, contratanteId) : [];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-universo-black">Parametrizações</h1>
        <p className="text-sm text-muted-foreground">
          Perfis de aprovação e modo de cadastro por agrupamento e parâmetro.
        </p>
      </div>

      <div className="grid gap-4 rounded-lg border border-border bg-card p-4">
        <AgrupamentoParametroFilters
          agrupamentos={agrupamentos}
          agrupamentoSelecionadoId={agrupamentoId}
          parametros={parametros}
          parametroSelecionadoId={parametroId}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <ContratanteSelector
            contratanteFixoNome={context.contratanteFixoNome}
            contratantesDisponiveis={context.contratantesDisponiveis}
            contratanteSelecionadoId={contratanteId}
          />
          {contratanteId && parametroId && (
            <PerfilParametrizacaoDialog parametroId={parametroId} contratanteId={contratanteId} />
          )}
        </div>
      </div>

      {!contratanteId ? (
        <p className="rounded-lg border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          Selecione uma contratante pra ver as parametrizações dela.
        </p>
      ) : !parametroId ? (
        <p className="rounded-lg border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          Selecione um agrupamento e um parâmetro.
        </p>
      ) : (
        <PerfilParametrizacaoTable perfis={perfis} parametroId={parametroId} contratanteId={contratanteId} />
      )}
    </div>
  );
}
