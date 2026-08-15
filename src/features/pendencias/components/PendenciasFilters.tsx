"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, X } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TODOS = "todos";

// Competência é guardada como "MM/AAAA" (ver documentos_entregues.competencia).
// input[type=month] devolve "AAAA-MM" — converte nos dois sentidos aqui, o
// resto do app só lida com o formato "MM/AAAA".
function competenciaParaMonthInput(competencia: string): string {
  const [mes, ano] = competencia.split("/");
  if (!mes || !ano) return "";
  return `${ano}-${mes}`;
}

function monthInputParaCompetencia(value: string): string {
  const [ano, mes] = value.split("-");
  if (!mes || !ano) return "";
  return `${mes}/${ano}`;
}

export function PendenciasFilters({
  empresas,
  documentos,
}: {
  empresas: { id: number; nome_fantasia: string }[];
  documentos: { id: number; descricao: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const empresaAtual = searchParams.get("empresa_id") ?? TODOS;
  const documentoAtual = searchParams.get("tipo_documento_id") ?? TODOS;
  const competenciaAtual = searchParams.get("competencia") ?? "";

  const [empresaId, setEmpresaId] = useState(empresaAtual);
  const [tipoDocumentoId, setTipoDocumentoId] = useState(documentoAtual);
  const [competenciaMes, setCompetenciaMes] = useState(
    competenciaAtual ? competenciaParaMonthInput(competenciaAtual) : ""
  );

  function aplicarFiltros() {
    const params = new URLSearchParams(searchParams.toString());

    if (empresaId === TODOS) params.delete("empresa_id");
    else params.set("empresa_id", empresaId);

    if (tipoDocumentoId === TODOS) params.delete("tipo_documento_id");
    else params.set("tipo_documento_id", tipoDocumentoId);

    const competencia = competenciaMes ? monthInputParaCompetencia(competenciaMes) : "";
    if (!competencia) params.delete("competencia");
    else params.set("competencia", competencia);

    router.push(`${pathname}?${params.toString()}`);
  }

  function limparFiltros() {
    setEmpresaId(TODOS);
    setTipoDocumentoId(TODOS);
    setCompetenciaMes("");
    router.push(pathname);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
      <div className="grid gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Empresa</label>
        <Select value={empresaId} onValueChange={setEmpresaId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Todas as empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todas as empresas</SelectItem>
            {empresas.map((empresa) => (
              <SelectItem key={empresa.id} value={String(empresa.id)}>
                {empresa.nome_fantasia}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Documento</label>
        <Select value={tipoDocumentoId} onValueChange={setTipoDocumentoId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Todos os documentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os documentos</SelectItem>
            {documentos.map((documento) => (
              <SelectItem key={documento.id} value={String(documento.id)}>
                {documento.descricao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Competência</label>
        <Input
          type="month"
          className="w-40"
          value={competenciaMes}
          onChange={(e) => setCompetenciaMes(e.target.value)}
        />
      </div>

      <Button onClick={aplicarFiltros}>
        <Filter />
        Filtrar
      </Button>
      <Button variant="ghost" onClick={limparFiltros}>
        <X />
        Limpar
      </Button>
    </div>
  );
}
