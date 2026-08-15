"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { setGrupoAtivoAction } from "@/features/grupos/actions";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function GrupoRowActions({
  grupoId,
  ativo,
  contratanteId,
}: {
  grupoId: number;
  ativo: boolean;
  contratanteId: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function aplicar(novoAtivo: boolean) {
    startTransition(async () => {
      const result = await setGrupoAtivoAction(grupoId, contratanteId, novoAtivo);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(novoAtivo ? "Grupo reativado." : "Grupo desativado.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <Switch
        checked={ativo}
        disabled={isPending}
        onCheckedChange={aplicar}
        aria-label={ativo ? "Desativar grupo" : "Ativar grupo"}
      />
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/grupos/${grupoId}/editar?contratante_id=${contratanteId}`}>
          <Pencil />
          <span className="sr-only">Editar</span>
        </Link>
      </Button>
    </div>
  );
}
