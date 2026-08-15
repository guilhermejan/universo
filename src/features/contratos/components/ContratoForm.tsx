"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { createContratoAction, updateContratoAction } from "@/features/contratos/actions";
import { contratoSchema, type ContratoInput } from "@/features/contratos/schema";
import { STATUS_CONTRATO_LABEL, STATUS_CONTRATO_OPCOES } from "@/features/contratos/types";
import type { ContratoRow } from "@/lib/types/database.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ContratoForm({
  contratanteId,
  terceirizadas,
  gestores,
  contrato,
}: {
  contratanteId: number;
  terceirizadas: { id: number; nome_fantasia: string }[];
  gestores: { id: string; nome: string }[];
  contrato?: ContratoRow;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContratoInput>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      empresa_terceirizada_id: contrato?.empresa_terceirizada_id,
      gestor_contrato_usuario_id: contrato?.gestor_contrato_usuario_id ?? "",
      numero_contrato: contrato?.numero_contrato ?? "",
      data_inicio: contrato?.data_inicio ?? "",
      data_fim: contrato?.data_fim ?? "",
      status: contrato?.status ?? "ativo",
    },
  });

  async function onSubmit(values: ContratoInput) {
    setServerError(null);
    const result = contrato
      ? await updateContratoAction(contrato.id, contratanteId, values)
      : await createContratoAction(contratanteId, values);
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
          <CardTitle>Vínculo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Terceirizada</Label>
            <Controller
              name="empresa_terceirizada_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a terceirizada" />
                  </SelectTrigger>
                  <SelectContent>
                    {terceirizadas.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nome_fantasia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.empresa_terceirizada_id && (
              <p className="text-sm text-destructive">{errors.empresa_terceirizada_id.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label>Gestor de contrato</Label>
            <Controller
              name="gestor_contrato_usuario_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum" />
                  </SelectTrigger>
                  <SelectContent>
                    {gestores.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="numero_contrato">Nº do contrato</Label>
            <Input id="numero_contrato" maxLength={50} {...register("numero_contrato")} />
          </div>

          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_CONTRATO_OPCOES.map((opcao) => (
                      <SelectItem key={opcao} value={opcao}>
                        {STATUS_CONTRATO_LABEL[opcao]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="data_inicio">Início da vigência</Label>
            <Input id="data_inicio" type="date" {...register("data_inicio")} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="data_fim">Fim da vigência</Label>
            <Input id="data_fim" type="date" {...register("data_fim")} />
            {errors.data_fim && <p className="text-sm text-destructive">{errors.data_fim.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {contrato ? "Salvar alterações" : "Criar contrato"}
        </Button>
      </div>
    </form>
  );
}
