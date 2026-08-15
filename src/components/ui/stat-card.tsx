import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "neutral",
}: {
  label: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  accent?: "neutral" | "brand";
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5",
          accent === "brand"
            ? "bg-gradient-to-r from-universo-blue-from to-universo-blue-to"
            : "bg-border"
        )}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-3xl font-bold tracking-tight text-universo-black">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-105",
            accent === "brand"
              ? "bg-gradient-to-br from-universo-blue-from to-universo-blue-to text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-4.5" />
        </div>
      </div>
    </div>
  );
}
