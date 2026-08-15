"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { addDocumentoAoPerfilAction } from "@/features/perfil-documento/actions";
import type { TipoDocumentoRow } from "@/lib/types/database.types";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function AdicionarDocumentoDialog({
  perfilId,
  tiposDisponiveis,
}: {
  perfilId: number;
  tiposDisponiveis: TipoDocumentoRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoDocumentoId, setTipoDocumentoId] = useState<string>("");
  const [bloqueiaAcesso, setBloqueiaAcesso] = useState(false);
  const [diasTolerancia, setDiasTolerancia] = useState("0");

  function resetar() {
    setTipoDocumentoId("");
    setBloqueiaAcesso(false);
    setDiasTolerancia("0");
  }

  async function onSubmit() {
    if (!tipoDocumentoId) {
      toast.error("Selecione um documento.");
      return;
    }
    const dias = Number(diasTolerancia);
    if (!Number.isInteger(dias) || dias < 0) {
      toast.error("Dias de tolerância deve ser um número inteiro maior ou igual a zero.");
      return;
    }

    setIsSubmitting(true);
    const result = await addDocumentoAoPerfilAction(
      perfilId,
      Number(tipoDocumentoId),
      bloqueiaAcesso,
      dias
    );
    setIsSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Documento vinculado ao perfil.");
    resetar();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} disabled={tiposDisponiveis.length === 0}>
        <Plus />
        Adicionar documento
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar documento ao perfil</DialogTitle>
          <DialogDescription>
            Define quais documentos esse perfil exige e como o vencimento é tratado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Documento</Label>
            <Select value={tipoDocumentoId} onValueChange={setTipoDocumentoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um documento" />
              </SelectTrigger>
              <SelectContent>
                {tiposDisponiveis.map((tipo) => (
                  <SelectItem key={tipo.id} value={String(tipo.id)}>
                    {tipo.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2.5">
            <Label className="text-sm font-medium">Bloqueia acesso</Label>
            <Switch checked={bloqueiaAcesso} onCheckedChange={setBloqueiaAcesso} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="dias_tolerancia">Dias de tolerância</Label>
            <Input
              id="dias_tolerancia"
              type="number"
              min={0}
              value={diasTolerancia}
              onChange={(e) => setDiasTolerancia(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
