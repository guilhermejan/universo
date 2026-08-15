"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import type { StatusBreakdownItem } from "@/features/dashboard/types";

const COLOR: Record<StatusBreakdownItem["status"], string> = {
  valido: "var(--status-valido)",
  entregue_a_conferir: "var(--status-a-conferir)",
  a_vencer: "var(--status-a-vencer)",
  vencido: "var(--status-vencido)",
  faltando: "#9ca3af",
};

export function StatusDonutChart({ data }: { data: StatusBreakdownItem[] }) {
  const total = data.reduce((acc, item) => acc + item.count, 0);
  const comValor = data.filter((item) => item.count > 0);

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        Sem documentos exigidos ainda.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={comValor}
              dataKey="count"
              nameKey="label"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
            >
              {comValor.map((item) => (
                <Cell key={item.status} fill={COLOR[item.status]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} documento(s)`, name]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-universo-black">{total}</span>
          <span className="text-[11px] text-muted-foreground">documentos</span>
        </div>
      </div>

      <ul className="grid gap-2 text-sm">
        {data.map((item) => (
          <li key={item.status} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLOR[item.status] }}
            />
            <span className="flex-1 text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground tabular-nums">{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
