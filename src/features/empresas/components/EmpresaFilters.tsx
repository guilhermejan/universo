"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIPO_EMPRESA_LABEL } from "@/features/empresas/types";
import type { TipoEmpresa } from "@/lib/types/database.types";

const TODOS = "todos";

export function EmpresaFilters({
  paisDisponiveis,
}: {
  paisDisponiveis: { id: number; nome_fantasia: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tipoAtual = searchParams.get("tipo") ?? TODOS;
  const paiAtual = searchParams.get("empresa_pai_id") ?? TODOS;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === TODOS) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={tipoAtual} onValueChange={(value) => updateParam("tipo", value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos os tipos</SelectItem>
          {(Object.keys(TIPO_EMPRESA_LABEL) as TipoEmpresa[]).map((tipo) => (
            <SelectItem key={tipo} value={tipo}>
              {TIPO_EMPRESA_LABEL[tipo]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={paiAtual}
        onValueChange={(value) => updateParam("empresa_pai_id", value)}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Empresa-pai" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todas as empresas-pai</SelectItem>
          {paisDisponiveis.map((empresa) => (
            <SelectItem key={empresa.id} value={String(empresa.id)}>
              {empresa.nome_fantasia}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
