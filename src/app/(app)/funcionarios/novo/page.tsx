import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getTerceirizadaContext, resolveTerceirizadaId } from "@/features/funcionarios/scope";
import { FuncionarioForm } from "@/features/funcionarios/components/FuncionarioForm";
import { Button } from "@/components/ui/button";

export default async function NovoFuncionarioPage({
  searchParams,
}: {
  searchParams: Promise<{ terceirizada_id?: string }>;
}) {
  const usuario = await requireUsuario();
  const params = await searchParams;
  const context = await getTerceirizadaContext(usuario);
  const terceirizadaId = resolveTerceirizadaId(context, params.terceirizada_id);

  if (!terceirizadaId) {
    redirect("/funcionarios");
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href={`/funcionarios?terceirizada_id=${terceirizadaId}`}>
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold text-universo-black">Novo funcionário</h1>
      </div>

      <FuncionarioForm terceirizadaId={terceirizadaId} />
    </div>
  );
}
