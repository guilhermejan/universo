"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  createTipoDocumentoAction,
  updateTipoDocumentoAction,
} from "@/features/tipos-documento/actions";
import { tipoDocumentoSchema, type TipoDocumentoInput } from "@/features/tipos-documento/schema";
import { PERIODICIDADE_LABEL, PERIODICIDADE_OPCOES } from "@/features/tipos-documento/types";
import type { TipoDocumentoRow } from "@/lib/types/database.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function SwitchField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2.5">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function TipoDocumentoForm({
  contratanteId,
  tipo,
}: {
  contratanteId: number;
  tipo?: TipoDocumentoRow;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TipoDocumentoInput>({
    resolver: zodResolver(tipoDocumentoSchema),
    defaultValues: {
      codigo: tipo?.codigo ?? "",
      descricao: tipo?.descricao ?? "",
      periodicidade: tipo?.periodicidade ?? "apresentar_uma_vez",
      frequencia_meses: tipo?.frequencia_meses ?? undefined,
      formato_apresentacao: tipo?.formato_apresentacao ?? "",
      funcao: tipo?.funcao ?? "padrao",
      permitir_editar_entrega: tipo?.permitir_editar_entrega ?? true,
      envia_email: tipo?.envia_email ?? false,
      anexo_obrigatorio: tipo?.anexo_obrigatorio ?? true,
      permite_isencao: tipo?.permite_isencao ?? false,
      contabilizar_pontualidade: tipo?.contabilizar_pontualidade ?? true,
      ativo: tipo?.ativo ?? true,
    },
  });

  const periodicidade = watch("periodicidade");

  async function onSubmit(values: TipoDocumentoInput) {
    setServerError(null);
    const result = tipo
      ? await updateTipoDocumentoAction(tipo.id, contratanteId, values)
      : await createTipoDocumentoAction(contratanteId, values);
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
            <Input id="codigo" placeholder="Auto" maxLength={10} {...register("codigo")} />
            {errors.codigo && <p className="text-sm text-destructive">{errors.codigo.message}</p>}
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="descricao">Nome do documento</Label>
            <Input id="descricao" maxLength={255} {...register("descricao")} />
            {errors.descricao && (
              <p className="text-sm text-destructive">{errors.descricao.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="funcao">Função</Label>
            <Input id="funcao" placeholder="Padrão" maxLength={50} {...register("funcao")} />
            {errors.funcao && <p className="text-sm text-destructive">{errors.funcao.message}</p>}
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="formato_apresentacao">Formato de apresentação</Label>
            <Input
              id="formato_apresentacao"
              placeholder="ex: Data DD/MM/AAAA"
              maxLength={100}
              {...register("formato_apresentacao")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Periodicidade</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Periodicidade</Label>
            <Controller
              name="periodicidade"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODICIDADE_OPCOES.map((opcao) => (
                      <SelectItem key={opcao} value={opcao}>
                        {PERIODICIDADE_LABEL[opcao]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.periodicidade && (
              <p className="text-sm text-destructive">{errors.periodicidade.message}</p>
            )}
          </div>

          {periodicidade === "periodico_a_partir_entrega" && (
            <div className="grid gap-1.5">
              <Label htmlFor="frequencia_meses">Frequência (meses)</Label>
              <Controller
                name="frequencia_meses"
                control={control}
                render={({ field }) => (
                  <Input
                    id="frequencia_meses"
                    type="number"
                    min={1}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                    }
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Validade = data da entrega + esse número de meses.
              </p>
              {errors.frequencia_meses && (
                <p className="text-sm text-destructive">{errors.frequencia_meses.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comportamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Controller
            name="permitir_editar_entrega"
            control={control}
            render={({ field }) => (
              <SwitchField
                label="Permitir editar entrega"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Controller
            name="envia_email"
            control={control}
            render={({ field }) => (
              <SwitchField
                label="Envia e-mail"
                description="Notifica o responsável quando o documento vence ou falta."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Controller
            name="anexo_obrigatorio"
            control={control}
            render={({ field }) => (
              <SwitchField
                label="Anexo obrigatório"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Controller
            name="permite_isencao"
            control={control}
            render={({ field }) => (
              <SwitchField
                label="Permite isenção"
                description='Pode marcar "não aplicável" pra uma empresa/funcionário específico.'
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Controller
            name="contabilizar_pontualidade"
            control={control}
            render={({ field }) => (
              <SwitchField
                label="Contabilizar na pontualidade"
                description="Entra no cálculo da barra de conformidade do dashboard."
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Controller
            name="ativo"
            control={control}
            render={({ field }) => (
              <SwitchField label="Ativo" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {tipo ? "Salvar alterações" : "Criar tipo de documento"}
        </Button>
      </div>
    </form>
  );
}
