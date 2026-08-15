"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { createFuncionarioAction, updateFuncionarioAction } from "@/features/funcionarios/actions";
import { funcionarioSchema, type FuncionarioInput } from "@/features/funcionarios/schema";
import type { FuncionarioRow } from "@/lib/types/database.types";
import { formatCpf } from "@/lib/utils/format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FuncionarioForm({
  terceirizadaId,
  funcionario,
}: {
  terceirizadaId: number;
  funcionario?: FuncionarioRow;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FuncionarioInput>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: {
      nome: funcionario?.nome ?? "",
      cpf: funcionario?.cpf ?? "",
      numero_inscricao: funcionario?.numero_inscricao ?? "",
      cargo: funcionario?.cargo ?? "",
      situacao: funcionario?.situacao ?? "ativo",
    },
  });

  async function onSubmit(values: FuncionarioInput) {
    setServerError(null);
    const result = funcionario
      ? await updateFuncionarioAction(funcionario.id, terceirizadaId, values)
      : await createFuncionarioAction(terceirizadaId, values);
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
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" maxLength={150} {...register("nome")} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <Input
                  id="cpf"
                  className="font-mono"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(formatCpf(e.target.value))}
                />
              )}
            />
            {errors.cpf && <p className="text-sm text-destructive">{errors.cpf.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="numero_inscricao">Nº de inscrição</Label>
            <Input id="numero_inscricao" maxLength={30} {...register("numero_inscricao")} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cargo">Cargo</Label>
            <Input id="cargo" maxLength={100} {...register("cargo")} />
          </div>

          <div className="grid gap-1.5">
            <Label>Situação</Label>
            <Controller
              name="situacao"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="desligado">Desligado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {funcionario ? "Salvar alterações" : "Criar funcionário"}
        </Button>
      </div>
    </form>
  );
}
