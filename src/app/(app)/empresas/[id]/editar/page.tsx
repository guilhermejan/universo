import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { assertEmpresaVisivel, PermissaoNegadaError } from "@/lib/auth/permissions";
import { getEmpresaById } from "@/features/empresas/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { EmpresaEditForm } from "@/features/empresas/components/EmpresaEditForm";
import { Button } from "@/components/ui/button";

export default async function EditarEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const empresaId = Number(id);
  if (!Number.isInteger(empresaId)) notFound();

  const usuario = await requireUsuario();

  if (usuario.papel === "terceiro") {
    redirect("/empresas");
  }

  try {
    await assertEmpresaVisivel(usuario, empresaId);
  } catch (err) {
    if (err instanceof PermissaoNegadaError) redirect("/empresas");
    throw err;
  }

  const empresa = await getEmpresaById(empresaId).catch(() => null);
  if (!empresa) notFound();

  let empresaPaiNome: string | null = null;
  if (empresa.empresa_pai_id) {
    const admin = createAdminClient();
    const { data } = (await admin
      .from("empresas")
      .select("nome_fantasia")
      .eq("id", empresa.empresa_pai_id)
      .single()) as { data: { nome_fantasia: string } | null };
    empresaPaiNome = data?.nome_fantasia ?? null;
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/empresas">
            <ArrowLeft />
            Voltar
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold text-universo-black">
          {empresa.nome_fantasia}
        </h1>
      </div>

      <EmpresaEditForm empresa={empresa} empresaPaiNome={empresaPaiNome} />
    </div>
  );
}
