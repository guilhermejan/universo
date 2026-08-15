"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { setEmpresaAtivoAction } from "@/features/empresas/actions";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function EmpresaRowActions({
  empresaId,
  nomeFantasia,
  ativo,
}: {
  empresaId: number;
  nomeFantasia: string;
  ativo: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function aplicar(novoAtivo: boolean) {
    startTransition(async () => {
      const result = await setEmpresaAtivoAction(empresaId, novoAtivo);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(novoAtivo ? "Empresa reativada." : "Empresa desativada.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <Switch
        checked={ativo}
        disabled={isPending}
        onCheckedChange={(checked) => {
          if (!checked) {
            setConfirmOpen(true);
            return;
          }
          aplicar(true);
        }}
        aria-label={ativo ? "Desativar empresa" : "Ativar empresa"}
      />
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/empresas/${empresaId}/editar`}>
          <Pencil />
          <span className="sr-only">Editar</span>
        </Link>
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar {nomeFantasia}?</AlertDialogTitle>
            <AlertDialogDescription>
              A empresa deixa de aparecer nas listas ativas, mas os dados são mantidos
              (nada é excluído). Você pode reativá-la a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => aplicar(false)}>Desativar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
