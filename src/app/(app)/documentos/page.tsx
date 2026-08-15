import { AlertTriangle, Clock, FileWarning } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { listPendencias, listTerceirizadasParaFiltro } from "@/features/pendencias/queries";
import { PendenciasFilters } from "@/features/pendencias/components/PendenciasFilters";
import { PendenciasWorkspace } from "@/features/pendencias/components/PendenciasWorkspace";
import { StatCard } from "@/components/ui/stat-card";

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa_id?: string; tipo_documento_id?: string; competencia?: string }>;
}) {
  const usuario = await requireUsuario();
  const params = await searchParams;

  const [todasPendencias, empresas] = await Promise.all([
    listPendencias(usuario),
    listTerceirizadasParaFiltro(usuario),
  ]);

  const documentosDisponiveis = Array.from(
    new Map(
      todasPendencias.map((item) => [item.tipoDocumentoId, { id: item.tipoDocumentoId, descricao: item.tipoDocumentoDescricao }])
    ).values()
  ).sort((a, b) => a.descricao.localeCompare(b.descricao));

  const filtroEmpresaId = params.empresa_id ? Number(params.empresa_id) : undefined;
  const filtroTipoDocumentoId = params.tipo_documento_id ? Number(params.tipo_documento_id) : undefined;
  const filtroCompetencia = params.competencia;

  const pendenciasFiltradas = todasPendencias.filter((item) => {
    if (filtroEmpresaId && item.empresaId !== filtroEmpresaId) return false;
    if (filtroTipoDocumentoId && item.tipoDocumentoId !== filtroTipoDocumentoId) return false;
    if (filtroCompetencia && item.competencia !== filtroCompetencia) return false;
    return true;
  });

  const stats = {
    vencidos: todasPendencias.filter((item) => item.status === "vencido").length,
    aVencer: todasPendencias.filter((item) => item.status === "a_vencer").length,
    faltando: todasPendencias.filter((item) => item.status === "faltando").length,
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-universo-black">
          Regularizar pendências
        </h1>
        <p className="text-sm text-muted-foreground">
          Documentos de empresas e funcionários vencidos, a vencer ou faltando.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Vencidos" value={stats.vencidos} icon={FileWarning} />
        <StatCard label="A vencer" value={stats.aVencer} icon={Clock} />
        <StatCard label="Faltando" value={stats.faltando} icon={AlertTriangle} />
      </div>

      <PendenciasFilters empresas={empresas} documentos={documentosDisponiveis} />

      <PendenciasWorkspace itens={pendenciasFiltradas} />
    </div>
  );
}
