"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { createEmpresaAction } from "@/features/empresas/actions";
import {
  empresaCreateSchema,
  type EmpresaCreateInput,
} from "@/features/empresas/schema";
import type { EmpresaFormContext } from "@/features/empresas/scope";
import { TIPO_EMPRESA_LABEL } from "@/features/empresas/types";
import type { TipoEmpresa } from "@/lib/types/database.types";
import { formatCnpj, formatCep, formatTelefone } from "@/lib/utils/format";
import { useCepLookup } from "@/lib/hooks/useCepLookup";
import { ESTADOS_BR } from "@/lib/constants/estados";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EmpresaCreateForm({ context }: { context: EmpresaFormContext }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { buscar: buscarCep, isLoading: isBuscandoCep } = useCepLookup();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaCreateInput>({
    resolver: zodResolver(empresaCreateSchema),
    defaultValues: {
      tipo: context.tiposPermitidos[0],
      empresa_pai_id: context.empresaPaiFixa ?? undefined,
    },
  });

  const tipoSelecionado = watch("tipo");

  // "Contratante" e "terceirizada com pai fixo" mostram o campo empresa-pai
  // como texto travado (não editável), então o valor precisa ser injetado no
  // form por aqui — não tem input visível de onde o RHF possa lê-lo sozinho.
  useEffect(() => {
    if (tipoSelecionado === "proprietaria_saas") {
      setValue("empresa_pai_id", undefined, { shouldValidate: true });
    } else if (tipoSelecionado === "contratante") {
      setValue("empresa_pai_id", context.universoId ?? undefined, { shouldValidate: true });
    } else if (tipoSelecionado === "terceirizada") {
      // Sem empresaPaiFixa (caso do admin_plataforma), fica undefined até o
      // usuário escolher a contratante no Select abaixo.
      setValue("empresa_pai_id", context.empresaPaiFixa ?? undefined, { shouldValidate: true });
    }
  }, [tipoSelecionado, context.universoId, context.empresaPaiFixa, setValue]);

  async function handleCepBlur(cep: string) {
    const resultado = await buscarCep(cep);
    if (!resultado) return;
    setValue("endereco", resultado.endereco, { shouldValidate: true });
    setValue("bairro", resultado.bairro, { shouldValidate: true });
    setValue("cidade", resultado.cidade, { shouldValidate: true });
    setValue("estado", resultado.estado, { shouldValidate: true });
  }

  async function onSubmit(values: EmpresaCreateInput) {
    setServerError(null);
    const result = await createEmpresaAction(values);
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
          <CardTitle>Hierarquia</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Tipo</Label>
            {context.tiposPermitidos.length > 1 ? (
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {context.tiposPermitidos.map((tipo: TipoEmpresa) => (
                        <SelectItem key={tipo} value={tipo}>
                          {TIPO_EMPRESA_LABEL[tipo]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Input value={TIPO_EMPRESA_LABEL[context.tiposPermitidos[0]]} disabled />
            )}
            {errors.tipo && <p className="text-sm text-destructive">{errors.tipo.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label>Empresa-pai</Label>
            {tipoSelecionado === "proprietaria_saas" && (
              <Input value="Nenhuma (é a raiz da plataforma)" disabled />
            )}
            {tipoSelecionado === "contratante" && (
              <Input value="UNIVERSO (automático)" disabled />
            )}
            {tipoSelecionado === "terceirizada" &&
              (context.empresaPaiFixa ? (
                <Input value={context.empresaPaiFixaNome ?? "Sua empresa"} disabled />
              ) : (
                <Controller
                  name="empresa_pai_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a contratante" />
                      </SelectTrigger>
                      <SelectContent>
                        {context.contratantesDisponiveis.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.nome_fantasia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ))}
            {errors.empresa_pai_id && (
              <p className="text-sm text-destructive">{errors.empresa_pai_id.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="razao_social">Razão social</Label>
            <Input id="razao_social" maxLength={255} {...register("razao_social")} />
            {errors.razao_social && (
              <p className="text-sm text-destructive">{errors.razao_social.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="nome_fantasia">Nome fantasia</Label>
            <Input id="nome_fantasia" maxLength={150} {...register("nome_fantasia")} />
            {errors.nome_fantasia && (
              <p className="text-sm text-destructive">{errors.nome_fantasia.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Controller
              name="cnpj"
              control={control}
              render={({ field }) => (
                <Input
                  id="cnpj"
                  className="font-mono"
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(formatCnpj(e.target.value))}
                />
              )}
            />
            {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj.message}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="inscricao_municipal">Inscrição municipal</Label>
            <Input id="inscricao_municipal" maxLength={30} {...register("inscricao_municipal")} />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="inscricao_estadual">Inscrição estadual</Label>
            <Input id="inscricao_estadual" maxLength={30} {...register("inscricao_estadual")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="cep">CEP</Label>
            <Controller
              name="cep"
              control={control}
              render={({ field }) => (
                <Input
                  id="cep"
                  placeholder="00000-000"
                  maxLength={9}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(formatCep(e.target.value))}
                  onBlur={(e) => handleCepBlur(e.target.value)}
                  disabled={isBuscandoCep}
                />
              )}
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" maxLength={255} {...register("endereco")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" maxLength={20} {...register("numero")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" maxLength={100} {...register("complemento")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" maxLength={100} {...register("bairro")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" maxLength={100} {...register("cidade")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="estado">UF</Label>
            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS_BR.map((e) => (
                      <SelectItem key={e.uf} value={e.uf}>
                        {e.uf} — {e.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.estado && <p className="text-sm text-destructive">{errors.estado.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responsável</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="responsavel_nome">Nome</Label>
            <Input id="responsavel_nome" maxLength={150} {...register("responsavel_nome")} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="responsavel_email">E-mail</Label>
            <Input id="responsavel_email" type="email" maxLength={150} {...register("responsavel_email")} />
            {errors.responsavel_email && (
              <p className="text-sm text-destructive">{errors.responsavel_email.message}</p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="responsavel_telefone">Telefone</Label>
            <Controller
              name="responsavel_telefone"
              control={control}
              render={({ field }) => (
                <Input
                  id="responsavel_telefone"
                  placeholder="(00) 00000-0000"
                  maxLength={16}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(formatTelefone(e.target.value))}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Criar empresa
        </Button>
      </div>
    </form>
  );
}
