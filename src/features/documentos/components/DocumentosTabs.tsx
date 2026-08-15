"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type Tab = { label: string; href: string };

export function DocumentosTabs({ podeGerenciar }: { podeGerenciar: boolean }) {
  const pathname = usePathname();

  const tabs: Tab[] = [
    { label: "Regularizar pendências", href: "/documentos" },
    ...(podeGerenciar
      ? [
          { label: "Biblioteca de documentos", href: "/documentos/tipos" },
          { label: "Perfis de documento", href: "/documentos/perfis" },
        ]
      : []),
  ];

  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/documentos" ? pathname === "/documentos" : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-universo-red text-universo-black"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
