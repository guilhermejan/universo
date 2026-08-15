"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  removeDocumentoDoPerfilAction,
  updateVinculoAction,
} from "@/features/perfil-documento/actions";
import type { VinculoPerfilDocumento } from "@/features/perfil-documento/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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

function VinculoRow({ perfilId, vinculo }: { perfilId: number; vinculo: VinculoPerfilDocumento }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [diasTolerancia, setDiasTolerancia] = useState(String(vinculo.dias_tolerancia));
  const [confirmOpen, setConfirmOpen] = useState(false);

  function commitBloqueiaAcesso(checked: boolean) {
    startTransition(async () => {
      const result = await updateVinculoAction(perfilId, vinculo.tipo_documento_id, {
        bloqueia_acesso: checked,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function commitAtivo(checked: boolean) {
    startTransition(async () => {
      const result = await updateVinculoAction(perfilId, vinculo.tipo_documento_id, {
        ativo: checked,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(checked ? "Documento reativado no perfil." : "Documento desativado no perfil.");
      router.refresh();
    });
  }

  function commitDiasTolerancia() {
    const parsed = Number(diasTolerancia);
    if (!Number.isInteger(parsed) || parsed < 0) {
      toast.error("Dias de tolerância deve ser um número inteiro maior ou igual a zero.");
      setDiasTolerancia(String(vinculo.dias_tolerancia));
      return;
    }
    if (parsed === vinculo.dias_tolerancia) return;

    startTransition(async () => {
      const result = await updateVinculoAction(perfilId, vinculo.tipo_documento_id, {
        dias_tolerancia: parsed,
      });
      if (result?.error) {
        toast.error(result.error);
        setDiasTolerancia(String(vinculo.dias_tolerancia));
        return;
      }
      router.refresh();
    });
  }

  function remover() {
    startTransition(async () => {
      const result = await removeDocumentoDoPerfilAction(perfilId, vinculo.tipo_documento_id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Documento removido do perfil.");
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{vinculo.tipo_documento_codigo}</TableCell>
      <TableCell className="font-medium text-foreground">{vinculo.tipo_documento_descricao}</TableCell>
      <TableCell>
        <Switch
          checked={vinculo.bloqueia_acesso}
          disabled={isPending}
          onCheckedChange={commitBloqueiaAcesso}
          aria-label="Bloqueia acesso"
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={vinculo.ativo}
          disabled={isPending}
          onCheckedChange={commitAtivo}
          aria-label={vinculo.ativo ? "Desativar vínculo" : "Ativar vínculo"}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={0}
          className="w-24"
          disabled={isPending}
          value={diasTolerancia}
          onChange={(e) => setDiasTolerancia(e.target.value)}
          onBlur={commitDiasTolerancia}
        />
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={() => setConfirmOpen(true)} disabled={isPending}>
          <Trash2 />
          <span className="sr-only">Remover</span>
        </Button>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover {vinculo.tipo_documento_descricao}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esse documento deixa de ser exigido por esse perfil. Documentos já entregues não são
                apagados.
              </AlertDialogDescription>
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

export function PerfilDocumentosTable({
  perfilId,
  vinculos,
}: {
  perfilId: number;
  vinculos: VinculoPerfilDocumento[];
}) {
  if (vinculos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border p-16 text-center">
        <Starburst className="size-10" />
        <div>
          <p className="font-medium text-foreground">Nenhum documento vinculado a esse perfil</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use o botão &quot;Adicionar documento&quot; pra começar a configurar esse perfil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Bloqueia acesso</TableHead>
            <TableHead>Dias de tolerância</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vinculos.map((vinculo) => (
            <VinculoRow key={vinculo.tipo_documento_id} perfilId={perfilId} vinculo={vinculo} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
