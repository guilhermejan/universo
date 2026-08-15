"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { createGrupoAction, updateGrupoAction } from "@/features/grupos/actions";
import { grupoSchema, type GrupoInput } from "@/features/grupos/schema";
import type { GrupoTerceiroRow } from "@/lib/types/database.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GrupoForm({
  contratanteId,
  grupo,
}: {
  contratanteId: number;
  grupo?: GrupoTerceiroRow;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<GrupoInput>({
    resolver: zodResolver(grupoSchema),
    defaultValues: {
      codigo: grupo?.codigo ?? "",
      nome: grupo?.nome ?? "",
      ativo: grupo?.ativo ?? true,
    },
  });

  async function onSubmit(values: GrupoInput) {
    setServerError(null);
    const result = grupo
      ? await updateGrupoAction(grupo.id, contratanteId, values)
      : await createGrupoAction(contratanteId, values);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
      {serverError && (
        <p className="rounded-md bg-status-vencido/10 px-3 py-2 text-sm text-status-vencido">
          {serverError}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="codigo">Código</Label>
            <Input id="codigo" placeholder="Opcional" maxLength={10} {...register("codigo")} />
            {errors.codigo && <p className="text-sm text-destructive">{errors.codigo.message}</p>}
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome do grupo</Label>
            <Input id="nome" maxLength={150} {...register("nome")} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2.5 sm:col-span-3">
            <Label className="text-sm font-medium">Ativo</Label>
            <Controller
              name="ativo"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {grupo ? "Salvar alterações" : "Criar grupo"}
        </Button>
      </div>
    </form>
  );
}
