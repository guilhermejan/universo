"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Starburst } from "@/components/branding/Starburst";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sidebar reduzida a um único ícone (o logo) — clicar abre um flyout com
// todos os itens de navegação, igual ao padrão do sistema de referência
// (rail estreito, um ícone só, menu completo num flyout ao lado).
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-14 shrink-0 flex-col items-center bg-universo-black py-3 md:flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Menu"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white transition-transform hover:scale-105"
          >
            <Starburst className="size-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={10} className="min-w-64">
          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gestão de Terceiros
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            if (!item.enabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground/50"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4" />
                    {item.label}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                    Em breve
                  </span>
                </div>
              );
            }

            return (
              <div key={item.href}>
                <DropdownMenuItem asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2",
                      isActive && "bg-universo-red/10 font-medium text-universo-red"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>

                {item.children && isActive && (
                  <div className="ml-6 grid gap-0.5 border-l border-border py-1 pl-2">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link
                          href={child.href}
                          className={cn(
                            "text-xs",
                            pathname === child.href && "font-medium text-universo-red"
                          )}
                        >
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}
