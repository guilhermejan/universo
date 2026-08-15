import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getContratanteContext, resolveContratanteId } from "@/features/documentos/scope";
import { TipoDocumentoForm } from "@/features/tipos-documento/components/TipoDocumentoForm";
import { Button } from "@/components/ui/button";

export default async function NovoTipoDocumentoPage({
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

  if (!contratanteId) {
    redirect("/documentos/tipos");
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href={`/documentos/tipos?contratante_id=${contratanteId}`}>
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold text-universo-black">
          Novo tipo de documento
        </h1>
      </div>

      <TipoDocumentoForm contratanteId={contratanteId} />
    </div>
  );
}
