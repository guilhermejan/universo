"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Some pra admin_contratante/gestor_contrato (contratanteFixoNome já diz
// tudo); só aparece como Select de fato pro admin_plataforma escolher em
// qual biblioteca de documentos ele está mexendo.
export function ContratanteSelector({
  contratanteFixoNome,
  contratantesDisponiveis,
  contratanteSelecionadoId,
}: {
  contratanteFixoNome: string | null;
  contratantesDisponiveis: { id: number; nome_fantasia: string }[];
  contratanteSelecionadoId: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (contratanteFixoNome) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Contratante:</span>
        <Badge variant="secondary">{contratanteFixoNome}</Badge>
      </div>
    );
  }

  function updateContratante(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("contratante_id", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Contratante:</span>
      <Select
        value={contratanteSelecionadoId ? String(contratanteSelecionadoId) : undefined}
        onValueChange={updateContratante}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Selecione a contratante" />
        </SelectTrigger>
        <SelectContent>
          {contratantesDisponiveis.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.nome_fantasia}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
