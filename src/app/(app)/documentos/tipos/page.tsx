import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getContratanteContext, resolveContratanteId } from "@/features/documentos/scope";
import { listTiposDocumento } from "@/features/tipos-documento/queries";
import { TiposDocumentoTable } from "@/features/tipos-documento/components/TiposDocumentoTable";
import { ContratanteSelector } from "@/features/documentos/components/ContratanteSelector";
import { Button } from "@/components/ui/button";

export default async function TiposDocumentoPage({
  searchParams,
}: {
  searchParams: Promise<{ contratante_id?: string }>;
}) {
  const usuario = await requireUsuario();
  if (usuario.papel === "terceiro") {
    redirect("/documentos");
  }

  const params = await searchParams;
  const context = await getContratanteContext(usuario);
  const contratanteId = resolveContratanteId(context, params.contratante_id);

  const tipos = contratanteId ? await listTiposDocumento(contratanteId) : [];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-universo-black">
            Biblioteca de documentos
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastro dos tipos de documento exigidos das empresas terceirizadas.
          </p>
        </div>
        {contratanteId && (
          <Button asChild>
            <Link href={`/documentos/tipos/novo?contratante_id=${contratanteId}`}>
              <Plus />
              Novo tipo de documento
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
        <TiposDocumentoTable tipos={tipos} contratanteId={contratanteId} />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          Selecione uma contratante pra ver a biblioteca de documentos dela.
        </p>
      )}
    </div>
  );
}
