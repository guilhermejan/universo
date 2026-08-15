"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ParametrizacaoAgrupamentoRow, ParametrizacaoParametroRow } from "@/lib/types/database.types";

export function AgrupamentoParametroFilters({
  agrupamentos,
  agrupamentoSelecionadoId,
  parametros,
  parametroSelecionadoId,
}: {
  agrupamentos: ParametrizacaoAgrupamentoRow[];
  agrupamentoSelecionadoId: number | null;
  parametros: ParametrizacaoParametroRow[];
  parametroSelecionadoId: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateAgrupamento(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("agrupamento_id", value);
    params.delete("parametro_id");
    router.push(`${pathname}?${params.toString()}`);
  }

  function updateParametro(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("parametro_id", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <span className="text-sm text-muted-foreground">Agrupamento</span>
        <Select
          value={agrupamentoSelecionadoId ? String(agrupamentoSelecionadoId) : undefined}
          onValueChange={updateAgrupamento}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um agrupamento" />
          </SelectTrigger>
          <SelectContent>
            {agrupamentos.map((agrupamento) => (
              <SelectItem key={agrupamento.id} value={String(agrupamento.id)}>
                {agrupamento.codigo} - {agrupamento.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <span className="text-sm text-muted-foreground">Parâmetro</span>
        <Select
          value={parametroSelecionadoId ? String(parametroSelecionadoId) : undefined}
          onValueChange={updateParametro}
          disabled={parametros.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um parâmetro" />
          </SelectTrigger>
          <SelectContent>
            {parametros.map((parametro) => (
              <SelectItem key={parametro.id} value={String(parametro.id)}>
                {parametro.codigo} - {parametro.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
