"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { setTipoDocumentoAtivoAction } from "@/features/tipos-documento/actions";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function TipoDocumentoRowActions({
  tipoId,
  ativo,
  contratanteId,
}: {
  tipoId: number;
  ativo: boolean;
  contratanteId: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function aplicar(novoAtivo: boolean) {
    startTransition(async () => {
      const result = await setTipoDocumentoAtivoAction(tipoId, novoAtivo);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(novoAtivo ? "Documento reativado." : "Documento desativado.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <Switch
        checked={ativo}
        disabled={isPending}
        onCheckedChange={aplicar}
        aria-label={ativo ? "Desativar documento" : "Ativar documento"}
      />
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/documentos/tipos/${tipoId}/editar?contratante_id=${contratanteId}`}>
          <Pencil />
          <span className="sr-only">Editar</span>
        </Link>
      </Button>
    </div>
  );
}
