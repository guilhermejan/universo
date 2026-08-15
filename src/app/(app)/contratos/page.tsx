import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getContratanteContext, resolveContratanteId } from "@/features/documentos/scope";
import { listContratos } from "@/features/contratos/queries";
import { ContratosTable } from "@/features/contratos/components/ContratosTable";
import { ContratanteSelector } from "@/features/documentos/components/ContratanteSelector";
import { Button } from "@/components/ui/button";

export default async function ContratosPage({
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

  const contratos = contratanteId ? await listContratos(contratanteId) : [];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-universo-black">Contratos</h1>
          <p className="text-sm text-muted-foreground">
            Vínculo formal entre a contratante e suas empresas terceirizadas.
          </p>
        </div>
        {contratanteId && (
          <Button asChild>
            <Link href={`/contratos/novo?contratante_id=${contratanteId}`}>
              <Plus />
              Novo contrato
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
        <ContratosTable contratos={contratos} contratanteId={contratanteId} />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          Selecione uma contratante pra ver os contratos dela.
        </p>
      )}
    </div>
  );
}
