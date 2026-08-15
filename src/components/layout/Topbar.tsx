import { UserMenu } from "@/components/layout/UserMenu";
import { TopbarTitle } from "@/components/layout/TopbarTitle";
import { MobileNav } from "@/components/layout/MobileNav";
import type { UsuarioProfile } from "@/lib/auth/session";

export function Topbar({ usuario }: { usuario: UsuarioProfile }) {
  return (
    <header className="flex h-20 items-center justify-between gap-3 border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <TopbarTitle />
      </div>
      <UserMenu usuario={usuario} />
    </header>
  );
}
