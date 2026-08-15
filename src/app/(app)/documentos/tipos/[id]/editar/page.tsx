import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getContratanteContext } from "@/features/documentos/scope";
import { getTipoDocumentoById } from "@/features/tipos-documento/queries";
import { TipoDocumentoForm } from "@/features/tipos-documento/components/TipoDocumentoForm";
import { Button } from "@/components/ui/button";

export default async function EditarTipoDocumentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tipoId = Number(id);
  if (!Number.isInteger(tipoId)) notFound();

  const usuario = await requireUsuario();
  if (usuario.papel === "terceiro") {
    redirect("/documentos");
  }

  const tipo = await getTipoDocumentoById(tipoId);
  if (!tipo) notFound();

  const context = await getContratanteContext(usuario);
  if (context.contratanteFixo && context.contratanteFixo !== tipo.empresa_contratante_id) {
    redirect("/documentos/tipos");
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href={`/documentos/tipos?contratante_id=${tipo.empresa_contratante_id}`}>
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold text-universo-black">
          {tipo.descricao}
        </h1>
      </div>

      <TipoDocumentoForm contratanteId={tipo.empresa_contratante_id} tipo={tipo} />
    </div>
  );
}
