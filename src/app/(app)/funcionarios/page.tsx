import Link from "next/link";
import { Plus } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getTerceirizadaContext, resolveTerceirizadaId } from "@/features/funcionarios/scope";
import { listFuncionarios } from "@/features/funcionarios/queries";
import { FuncionariosTable } from "@/features/funcionarios/components/FuncionariosTable";
import { TerceirizadaSelector } from "@/features/funcionarios/components/TerceirizadaSelector";
import { Button } from "@/components/ui/button";

export default async function FuncionariosPage({
  searchParams,
}: {
  searchParams: Promise<{ terceirizada_id?: string }>;
}) {
  const usuario = await requireUsuario();
  const params = await searchParams;
  const context = await getTerceirizadaContext(usuario);
  const terceirizadaId = resolveTerceirizadaId(context, params.terceirizada_id);

  const funcionarios = terceirizadaId ? await listFuncionarios(terceirizadaId) : [];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-universo-black">Funcionários</h1>
          <p className="text-sm text-muted-foreground">
            Cadastro de pessoas vinculadas a essa empresa terceirizada.
          </p>
        </div>
        {terceirizadaId && (
          <Button asChild>
            <Link href={`/funcionarios/novo?terceirizada_id=${terceirizadaId}`}>
              <Plus />
              Novo funcionário
            </Link>
          </Button>
        )}
      </div>

      <TerceirizadaSelector
        terceirizadaFixaNome={context.terceirizadaFixaNome}
        terceirizadasDisponiveis={context.terceirizadasDisponiveis}
        terceirizadaSelecionadaId={terceirizadaId}
      />

      {terceirizadaId ? (
        <FuncionariosTable funcionarios={funcionarios} terceirizadaId={terceirizadaId} />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          Selecione uma empresa pra ver os funcionários dela.
        </p>
      )}
    </div>
  );
}
