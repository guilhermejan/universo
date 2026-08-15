import Link from "next/link";
import { Plus, Building2, Handshake, Users2, CheckCircle2 } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { listEmpresas, listEmpresasVisiveisParaFiltro } from "@/features/empresas/queries";
import { EmpresasTable } from "@/features/empresas/components/EmpresasTable";
import { EmpresaFilters } from "@/features/empresas/components/EmpresaFilters";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import type { TipoEmpresa } from "@/lib/types/database.types";

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; empresa_pai_id?: string }>;
}) {
  const usuario = await requireUsuario();
  const params = await searchParams;

  const filtroTipo = params.tipo as TipoEmpresa | undefined;
  const filtroEmpresaPaiId = params.empresa_pai_id ? Number(params.empresa_pai_id) : undefined;

  // Busca tudo que o usuário enxerga uma vez só: os cards de indicador
  // sempre refletem o panorama completo, e a tabela filtra em memória a
  // partir do mesmo resultado (sem round-trip extra pro banco por filtro).
  const [todasVisiveis, paisDisponiveis] = await Promise.all([
    listEmpresas(usuario),
    listEmpresasVisiveisParaFiltro(usuario),
  ]);

  const empresasFiltradas = todasVisiveis.filter((empresa) => {
    if (filtroTipo && empresa.tipo !== filtroTipo) return false;
    if (filtroEmpresaPaiId && empresa.empresa_pai_id !== filtroEmpresaPaiId) return false;
    return true;
  });

  const podeGerenciar = usuario.papel !== "terceiro";

  const stats = {
    total: todasVisiveis.length,
    contratantes: todasVisiveis.filter((e) => e.tipo === "contratante").length,
    terceirizadas: todasVisiveis.filter((e) => e.tipo === "terceirizada").length,
    ativas: todasVisiveis.filter((e) => e.ativo).length,
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-universo-black">
            Empresas
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastro de empresas contratantes e terceirizadas.
          </p>
        </div>
        {podeGerenciar && (
          <Button asChild>
            <Link href="/empresas/novo">
              <Plus />
              Nova empresa
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total de empresas" value={stats.total} icon={Building2} accent="brand" />
        <StatCard label="Contratantes" value={stats.contratantes} icon={Handshake} />
        <StatCard label="Terceirizadas" value={stats.terceirizadas} icon={Users2} />
        <StatCard label="Ativas" value={stats.ativas} icon={CheckCircle2} />
      </div>

      <EmpresaFilters paisDisponiveis={paisDisponiveis} />

      <EmpresasTable empresas={empresasFiltradas} />
    </div>
  );
}
