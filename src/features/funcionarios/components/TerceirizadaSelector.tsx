"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function TerceirizadaSelector({
  terceirizadaFixaNome,
  terceirizadasDisponiveis,
  terceirizadaSelecionadaId,
}: {
  terceirizadaFixaNome: string | null;
  terceirizadasDisponiveis: { id: number; nome_fantasia: string }[];
  terceirizadaSelecionadaId: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (terceirizadaFixaNome) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Empresa:</span>
        <Badge variant="secondary">{terceirizadaFixaNome}</Badge>
      </div>
    );
  }

  function updateTerceirizada(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("terceirizada_id", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Empresa:</span>
      <Select
        value={terceirizadaSelecionadaId ? String(terceirizadaSelecionadaId) : undefined}
        onValueChange={updateTerceirizada}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Selecione a empresa" />
        </SelectTrigger>
        <SelectContent>
          {terceirizadasDisponiveis.map((t) => (
            <SelectItem key={t.id} value={String(t.id)}>
              {t.nome_fantasia}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
