import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getContratanteContext, resolveContratanteId } from "@/features/documentos/scope";
import { GrupoForm } from "@/features/grupos/components/GrupoForm";
import { Button } from "@/components/ui/button";

export default async function NovoGrupoPage({
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

  if (!contratanteId) {
    redirect("/grupos");
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href={`/grupos?contratante_id=${contratanteId}`}>
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold text-universo-black">Novo grupo</h1>
      </div>

      <GrupoForm contratanteId={contratanteId} />
    </div>
  );
}
