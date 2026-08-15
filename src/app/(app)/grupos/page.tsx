import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getContratanteContext, resolveContratanteId } from "@/features/documentos/scope";
import { listGrupos } from "@/features/grupos/queries";
import { GruposTable } from "@/features/grupos/components/GruposTable";
import { ContratanteSelector } from "@/features/documentos/components/ContratanteSelector";
import { Button } from "@/components/ui/button";

export default async function GruposPage({
  searchParams,
}: {
  searchParams: Promise<{ contratante_id?: string }>;
}) {
  const usuario = await requireUsuario();
  if (usuario.papel === "terceiro") {
    redirect("/empresas");
  }

  const params = await searchParams;
  const context = await getContratanteContext(usuario);
  const contratanteId = resolveContratanteId(context, params.contratante_id);

  const grupos = contratanteId ? await listGrupos(contratanteId) : [];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-universo-black">Grupos</h1>
          <p className="text-sm text-muted-foreground">
            Classificação das empresas terceirizadas dessa contratante.
          </p>
        </div>
        {context.podeGerenciar && contratanteId && (
          <Button asChild>
            <Link href={`/grupos/novo?contratante_id=${contratanteId}`}>
              <Plus />
              Novo grupo
            </Link>
          </Button>
        )}
      </div>

      <ContratanteSelector
        contratanteFixoNome={context.contratanteFixoNome}
        contratantesDisponiveis={context.contratantesDisponiveis}
        contratanteSelecionadoId={contratanteId}
      />

      {contratanteId ? (
        <GruposTable grupos={grupos} contratanteId={contratanteId} />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          Selecione uma contratante pra ver os grupos dela.
        </p>
      )}
    </div>
  );
}
