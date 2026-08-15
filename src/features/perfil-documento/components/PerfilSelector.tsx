"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PerfilDocumentalRow } from "@/lib/types/database.types";

export function PerfilSelector({
  perfis,
  perfilSelecionadoId,
}: {
  perfis: PerfilDocumentalRow[];
  perfilSelecionadoId: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updatePerfil(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("perfil_id", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Perfil documental:</span>
      <Select
        value={perfilSelecionadoId ? String(perfilSelecionadoId) : undefined}
        onValueChange={updatePerfil}
      >
        <SelectTrigger className="w-72">
          <SelectValue placeholder="Selecione um perfil" />
        </SelectTrigger>
        <SelectContent>
          {perfis.map((perfil) => (
            <SelectItem key={perfil.id} value={String(perfil.id)}>
              {perfil.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
