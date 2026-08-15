import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getContratanteContext } from "@/features/documentos/scope";
import {
  getContratoById,
  listTerceirizadasDaContratante,
  listGestoresDaContratante,
} from "@/features/contratos/queries";
import { ContratoForm } from "@/features/contratos/components/ContratoForm";
import { Button } from "@/components/ui/button";

export default async function EditarContratoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contratoId = Number(id);
  if (!Number.isInteger(contratoId)) notFound();

  const usuario = await requireUsuario();
  if (usuario.papel === "terceiro") {
    redirect("/empresas");
  }

  const contrato = await getContratoById(contratoId);
  if (!contrato) notFound();

  const context = await getContratanteContext(usuario);
  if (context.contratanteFixo && context.contratanteFixo !== contrato.empresa_contratante_id) {
    redirect("/contratos");
  }

  const [terceirizadas, gestores] = await Promise.all([
    listTerceirizadasDaContratante(contrato.empresa_contratante_id),
    listGestoresDaContratante(contrato.empresa_contratante_id),
  ]);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href={`/contratos?contratante_id=${contrato.empresa_contratante_id}`}>
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold text-universo-black">
          {contrato.numero_contrato ?? `Contrato #${contrato.id}`}
        </h1>
      </div>

      <ContratoForm
        contratanteId={contrato.empresa_contratante_id}
        terceirizadas={terceirizadas}
        gestores={gestores}
        contrato={contrato}
      />
    </div>
  );
}
