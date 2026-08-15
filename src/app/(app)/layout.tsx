import { requireUsuario } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requireUsuario();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar usuario={usuario} />
        <main className="flex-1 overflow-y-auto bg-universo-offwhite p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
