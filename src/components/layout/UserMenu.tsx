import { LogOut } from "lucide-react";

import { logoutAction } from "@/features/auth/actions";
import type { UsuarioProfile } from "@/lib/auth/session";
import { initials } from "@/lib/utils/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAPEL_LABEL: Record<UsuarioProfile["papel"], string> = {
  admin_plataforma: "Admin UNIVERSO",
  admin_contratante: "Admin Contratante",
  gestor_contrato: "Gestor de Contrato",
  terceiro: "Terceiro",
};

export function UserMenu({ usuario }: { usuario: UsuarioProfile }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-muted">
        <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-universo-blue-from to-universo-blue-to text-xs font-semibold text-white">
          {initials(usuario.nome)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block font-medium leading-tight">{usuario.nome}</span>
          <span className="block text-xs leading-tight text-muted-foreground">
            {PAPEL_LABEL[usuario.papel]}
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{usuario.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut />
              Sair
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
