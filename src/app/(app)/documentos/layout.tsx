import { requireUsuario } from "@/lib/auth/session";
import { DocumentosTabs } from "@/features/documentos/components/DocumentosTabs";

export default async function DocumentosLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requireUsuario();
  const podeGerenciar = usuario.papel !== "terceiro";

  return (
    <div className="grid gap-6">
      <DocumentosTabs podeGerenciar={podeGerenciar} />
      {children}
    </div>
  );
}
