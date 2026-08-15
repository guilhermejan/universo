import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getEmpresaFormContext } from "@/features/empresas/scope";
import { EmpresaCreateForm } from "@/features/empresas/components/EmpresaCreateForm";
import { Button } from "@/components/ui/button";

export default async function NovaEmpresaPage() {
  const usuario = await requireUsuario();
  const context = await getEmpresaFormContext(usuario);

  if (context.tiposPermitidos.length === 0) {
    redirect("/empresas");
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/empresas">
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold text-universo-black">
          Nova empresa
        </h1>
      </div>

      <EmpresaCreateForm context={context} />
    </div>
  );
}
