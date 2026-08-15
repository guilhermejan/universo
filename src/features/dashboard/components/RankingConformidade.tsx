import { cn } from "@/lib/utils";
import type { RankingItem } from "@/features/dashboard/types";
import { Starburst } from "@/components/branding/Starburst";

function corPorPercentual(percent: number): string {
  if (percent >= 90) return "var(--status-valido)";
  if (percent >= 70) return "var(--status-a-vencer)";
  return "var(--status-vencido)";
}

export function RankingConformidade({ items, label }: { items: RankingItem[]; label: string }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Starburst className="size-8" />
        <p className="text-sm text-muted-foreground">
          Nenhuma pendência exigida ainda pra calcular um ranking de {label.toLowerCase()}.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4">
      {items.map((item, i) => {
        const cor = corPorPercentual(item.conformidadePercent);
        return (
          <li key={item.id} className="grid gap-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white",
                    i === 0 ? "bg-universo-red" : "bg-universo-black/70"
                  )}
                >
                  {i + 1}
                </span>
                {item.nome}
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {item.vencidos > 0 && (
                  <span className="text-status-vencido">{item.vencidos} vencido(s)</span>
                )}
                {item.faltando > 0 && <span>{item.faltando} faltando</span>}
                <span className="font-semibold tabular-nums" style={{ color: cor }}>
                  {item.conformidadePercent}%
                </span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.conformidadePercent}%`, backgroundColor: cor }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
