"use client";

import { useState } from "react";

import { PendenciasTable } from "@/features/pendencias/components/PendenciasTable";
import { RegularizarPendenciasPanel } from "@/features/pendencias/components/RegularizarPendenciasPanel";
import type { PendenciaItem } from "@/features/pendencias/types";

export function PendenciasWorkspace({ itens }: { itens: PendenciaItem[] }) {
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  function toggleTodos(marcar: boolean) {
    setSelecionados(marcar ? new Set(itens.map((item) => item.id)) : new Set());
  }

  return (
    <div className="grid gap-6">
      <PendenciasTable
        itens={itens}
        selecionados={selecionados}
        onToggle={toggle}
        onToggleTodos={toggleTodos}
      />

      {selecionados.size > 0 && (
        <RegularizarPendenciasPanel
          selecionados={Array.from(selecionados)}
          onConcluido={() => setSelecionados(new Set())}
        />
      )}
    </div>
  );
}
