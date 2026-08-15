"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { updateEmpresaAction } from "@/features/empresas/actions";
import { empresaUpdateSchema, type EmpresaUpdateInput } from "@/features/empresas/schema";
import { TIPO_EMPRESA_LABEL } from "@/features/empresas/types";
import type { EmpresaRow } from "@/lib/types/database.types";
import { formatCnpj, formatCep, formatTelefone } from "@/lib/utils/format";
import { useCepLookup } from "@/lib/hooks/useCepLookup";
import { ESTADOS_BR } from "@/lib/constants/estados";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EmpresaEditForm({
  empresa,
  empresaPaiNome,
}: {
  empresa: EmpresaRow;
  empresaPaiNome: string | null;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { buscar: buscarCep, isLoading: isBuscandoCep } = useCepLookup();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmpresaUpdateInput>({
    resolver: zodResolver(empresaUpdateSchema),
    defaultValues: {
      razao_social: empresa.razao_social,
      nome_fantasia: empresa.nome_fantasia,
      cnpj: empresa.cnpj,
      inscricao_municipal: empresa.inscricao_municipal ?? undefined,
      inscricao_estadual: empresa.inscricao_estadual ?? undefined,
      endereco: empresa.endereco ?? undefined,
      numero: empresa.numero ?? undefined,
      complemento: empresa.complemento ?? undefined,
      bairro: empresa.bairro ?? undefined,
      cidade: empresa.cidade ?? undefined,
      estado: empresa.estado ?? undefined,
      cep: empresa.cep ?? undefined,
      responsavel_nome: empresa.responsavel_nome ?? undefined,
      responsavel_email: empresa.responsavel_email ?? undefined,
      responsavel_telefone: empresa.responsavel_telefone ?? undefined,
    },
  });

  async function handleCepBlur(cep: string) {
    const resultado = await buscarCep(cep);
    if (!resultado) return;
    setValue("endereco", resultado.endereco, { shouldValidate: true });
    setValue("bairro", resultado.bairro, { shouldValidate: true });
    setValue("cidade", resultado.cidade, { shouldValidate: true });
    setValue("estado", resultado.estado, { shouldValidate: true });
  }

  async function onSubmit(values: EmpresaUpdateInput) {
    setServerError(null);
    const result = await updateEmpresaAction(empresa.id, values);
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
        <CardContent className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">Tipo:</span>
          <Badge variant="secondary">{TIPO_EMPRESA_LABEL[empresa.tipo]}</Badge>
          {empresaPaiNome && (
            <>
              <span className="text-muted-foreground">Empresa-pai:</span>
              <Badge variant="outline">{empresaPaiNome}</Badge>
            </>
          )}
          <span className="text-xs text-muted-foreground">
            (não é possível alterar o tipo ou reparentar uma empresa depois de criada)
          </span>
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
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
