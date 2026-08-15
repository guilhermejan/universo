"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  empresas: "Empresas",
  documentos: "Documentos",
  grupos: "Grupos",
  parametrizacoes: "Parametrizações",
  funcionarios: "Funcionários",
  contratos: "Contratos",
};

export function TopbarTitle() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [section, ...rest] = segments;
  const sectionLabel = SECTION_LABELS[section];

  if (!sectionLabel) return <div />;

  let trailingLabel: string | null = null;
  if (rest[0] === "novo") trailingLabel = "Nova empresa";
  else if (rest[rest.length - 1] === "editar") trailingLabel = "Editar";

  return (
    <div className="flex items-center gap-2 font-display text-base font-semibold text-universo-black">
      <span className={trailingLabel ? "text-muted-foreground" : undefined}>
        {sectionLabel}
      </span>
      {trailingLabel && (
        <>
          <ChevronRight className="size-3.5 text-muted-foreground" />
          <span>{trailingLabel}</span>
        </>
      )}
    </div>
  );
}
