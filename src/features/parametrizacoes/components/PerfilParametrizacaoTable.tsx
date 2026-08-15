"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deletePerfilParametrizacaoAction } from "@/features/parametrizacoes/actions";
import { TIPO_ENTIDADE_LABEL, NIVEL_APROVACAO_LABEL } from "@/features/parametrizacoes/types";
import { PerfilParametrizacaoDialog } from "@/features/parametrizacoes/components/PerfilParametrizacaoDialog";
import type { ParametrizacaoPerfilRow } from "@/lib/types/database.types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Starburst } from "@/components/branding/Starburst";

function PerfilRow({
  perfil,
  parametroId,
  contratanteId,
}: {
  perfil: ParametrizacaoPerfilRow;
  parametroId: number;
  contratanteId: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function remover() {
    startTransition(async () => {
      const result = await deletePerfilParametrizacaoAction(perfil.id, contratanteId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Perfil removido.");
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{TIPO_ENTIDADE_LABEL[perfil.tipo_entidade]}</TableCell>
      <TableCell className="font-mono text-xs">{perfil.codigo}</TableCell>
      <TableCell className="font-medium text-foreground">{perfil.descricao}</TableCell>
      <TableCell className="text-muted-foreground">{NIVEL_APROVACAO_LABEL[perfil.nivel_aprovacao]}</TableCell>
      <TableCell className="text-muted-foreground">{perfil.modo_cadastro ?? "—"}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <PerfilParametrizacaoDialog parametroId={parametroId} contratanteId={contratanteId} perfil={perfil} />
          <Button variant="ghost" size="icon" onClick={() => setConfirmOpen(true)} disabled={isPending}>
            <Trash2 />
            <span className="sr-only">Remover</span>
          </Button>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover {perfil.descricao}?</AlertDialogTitle>
              <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={remover}>Remover</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

export function PerfilParametrizacaoTable({
  perfis,
  parametroId,
  contratanteId,
}: {
  perfis: ParametrizacaoPerfilRow[];
  parametroId: number;
  contratanteId: number;
}) {
  if (perfis.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border p-16 text-center">
        <Starburst className="size-10" />
        <div>
          <p className="font-medium text-foreground">Nenhum resultado com os filtros atuais</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use o botão &quot;Novo&quot; pra cadastrar o primeiro perfil desse parâmetro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="bg-universo-blue-to px-4 py-2 text-sm font-medium text-white">
        Resultados encontrados com os filtros atuais: {perfis.length}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Nível aprovação</TableHead>
            <TableHead>Modo cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {perfis.map((perfil) => (
            <PerfilRow key={perfil.id} perfil={perfil} parametroId={parametroId} contratanteId={contratanteId} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
