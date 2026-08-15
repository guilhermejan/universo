import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getContratanteContext } from "@/features/documentos/scope";
import { getGrupoById } from "@/features/grupos/queries";
import { GrupoForm } from "@/features/grupos/components/GrupoForm";
import { Button } from "@/components/ui/button";

export default async function EditarGrupoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const grupoId = Number(id);
  if (!Number.isInteger(grupoId)) notFound();

  const usuario = await requireUsuario();
  if (usuario.papel === "terceiro") {
    redirect("/empresas");
  }

  const grupo = await getGrupoById(grupoId);
  if (!grupo) notFound();

  const context = await getContratanteContext(usuario);
  if (context.contratanteFixo && context.contratanteFixo !== grupo.empresa_contratante_id) {
    redirect("/grupos");
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href={`/grupos?contratante_id=${grupo.empresa_contratante_id}`}>
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold text-universo-black">{grupo.nome}</h1>
      </div>

      <GrupoForm contratanteId={grupo.empresa_contratante_id} grupo={grupo} />
    </div>
  );
}
