import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getContratanteContext, resolveContratanteId } from "@/features/documentos/scope";
import { listTerceirizadasDaContratante, listGestoresDaContratante } from "@/features/contratos/queries";
import { ContratoForm } from "@/features/contratos/components/ContratoForm";
import { Button } from "@/components/ui/button";

export default async function NovoContratoPage({
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
    redirect("/contratos");
  }

  const [terceirizadas, gestores] = await Promise.all([
    listTerceirizadasDaContratante(contratanteId),
    listGestoresDaContratante(contratanteId),
  ]);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href={`/contratos?contratante_id=${contratanteId}`}>
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold text-universo-black">Novo contrato</h1>
      </div>

      {terceirizadas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          Essa contratante ainda não tem nenhuma empresa terceirizada cadastrada. Cadastre uma em
          Empresas antes de criar um contrato.
        </p>
      ) : (
        <ContratoForm contratanteId={contratanteId} terceirizadas={terceirizadas} gestores={gestores} />
      )}
    </div>
  );
}
