"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { setFuncionarioSituacaoAction } from "@/features/funcionarios/actions";
import type { SituacaoFuncionario } from "@/lib/types/database.types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function FuncionarioRowActions({
  funcionarioId,
  situacao,
  terceirizadaId,
}: {
  funcionarioId: number;
  situacao: SituacaoFuncionario;
  terceirizadaId: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const ativo = situacao === "ativo";

  function aplicar(novoAtivo: boolean) {
    startTransition(async () => {
      const result = await setFuncionarioSituacaoAction(
        funcionarioId,
        terceirizadaId,
        novoAtivo ? "ativo" : "desligado"
      );
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(novoAtivo ? "Funcionário reativado." : "Funcionário desligado.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <Switch
        checked={ativo}
        disabled={isPending}
        onCheckedChange={aplicar}
        aria-label={ativo ? "Desligar funcionário" : "Reativar funcionário"}
      />
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/funcionarios/${funcionarioId}/editar?terceirizada_id=${terceirizadaId}`}>
          <Pencil />
          <span className="sr-only">Editar</span>
        </Link>
      </Button>
    </div>
  );
}
