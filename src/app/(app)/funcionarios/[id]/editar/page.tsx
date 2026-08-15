import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getTerceirizadaContext } from "@/features/funcionarios/scope";
import { getFuncionarioById } from "@/features/funcionarios/queries";
import { FuncionarioForm } from "@/features/funcionarios/components/FuncionarioForm";
import { Button } from "@/components/ui/button";

export default async function EditarFuncionarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const funcionarioId = Number(id);
  if (!Number.isInteger(funcionarioId)) notFound();

  const usuario = await requireUsuario();
  const funcionario = await getFuncionarioById(funcionarioId);
  if (!funcionario) notFound();

  const context = await getTerceirizadaContext(usuario);
  if (context.terceirizadaFixa && context.terceirizadaFixa !== funcionario.empresa_terceirizada_id) {
    redirect("/funcionarios");
  }
  if (
    !context.terceirizadaFixa &&
    !context.terceirizadasDisponiveis.some((t) => t.id === funcionario.empresa_terceirizada_id)
  ) {
    redirect("/funcionarios");
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href={`/funcionarios?terceirizada_id=${funcionario.empresa_terceirizada_id}`}>
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold text-universo-black">{funcionario.nome}</h1>
      </div>

      <FuncionarioForm terceirizadaId={funcionario.empresa_terceirizada_id} funcionario={funcionario} />
    </div>
  );
}
