"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/branding/Logo";
import { NAV_ITEMS } from "@/components/layout/nav-items";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md text-universo-black transition-colors hover:bg-muted md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden" />
        <DialogPrimitive.Content
          className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-universo-black text-white shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left md:hidden"
        >
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Menu de navegação da plataforma
          </DialogPrimitive.Description>
          <div className="flex h-20 items-center justify-between bg-white px-5">
            <Logo height={44} width={90} />
            <DialogPrimitive.Close className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-3">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              if (!item.enabled) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-white/35"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="size-4" />
                      {item.label}
                    </span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                      Em breve
                    </span>
                  </div>
                );
              }

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-universo-red text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                  {item.children && isActive && (
                    <div className="ml-10 mt-1 grid gap-1 border-l border-white/10 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "rounded-md px-2 py-1.5 text-sm transition-colors",
                            pathname === child.href
                              ? "font-medium text-universo-red"
                              : "text-white/60 hover:text-white"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
