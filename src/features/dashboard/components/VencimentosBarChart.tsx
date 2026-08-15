"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

import type { VencimentoMes } from "@/features/dashboard/types";

export function VencimentosBarChart({ data }: { data: VencimentoMes[] }) {
  const semDados = data.every((item) => item.count === 0);

  if (semDados) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        Nenhum vencimento previsto nos próximos 6 meses.
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={28}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            formatter={(value) => [`${value} documento(s)`, "Vencendo"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {data.map((item, i) => (
              <Cell key={item.chave} fill={i === 0 ? "var(--universo-red)" : "var(--universo-blue-to)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
