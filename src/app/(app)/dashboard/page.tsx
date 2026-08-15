import { Handshake, Building2, Users2, AlertTriangle, Clock3, FileX2, ShieldCheck } from "lucide-react";

import { requireUsuario } from "@/lib/auth/session";
import { getDashboardData } from "@/features/dashboard/queries";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDonutChart } from "@/features/dashboard/components/StatusDonutChart";
import { VencimentosBarChart } from "@/features/dashboard/components/VencimentosBarChart";
import { RankingConformidade } from "@/features/dashboard/components/RankingConformidade";
import { cn } from "@/lib/utils";

function corConformidade(percent: number): string {
  if (percent >= 90) return "text-status-valido";
  if (percent >= 70) return "text-status-a-vencer";
  return "text-status-vencido";
}

export default async function DashboardPage() {
  const usuario = await requireUsuario();
  const data = await getDashboardData(usuario);
  const { kpis } = data;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-universo-black">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Panorama consolidado de conformidade documental.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-3 shadow-sm">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-universo-blue-from to-universo-blue-to text-white shadow-sm"
            )}
          >
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Conformidade geral</p>
            <p className={cn("font-display text-3xl font-bold tabular-nums", corConformidade(kpis.conformidadePercent))}>
              {kpis.conformidadePercent}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.contratantesAtivas !== null && (
          <StatCard label="Contratantes ativas" value={kpis.contratantesAtivas} icon={Handshake} accent="brand" />
        )}
        <StatCard label="Terceirizadas ativas" value={kpis.terceirizadasAtivas} icon={Building2} accent="brand" />
        <StatCard label="Funcionários ativos" value={kpis.funcionariosAtivos} icon={Users2} />
        <StatCard label="Documentos vencidos" value={kpis.documentosVencidos} icon={AlertTriangle} />
        <StatCard label="A vencer (30 dias)" value={kpis.documentosAVencer} icon={Clock3} />
        <StatCard label="Documentos faltando" value={kpis.documentosFaltando} icon={FileX2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vencimentos nos próximos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <VencimentosBarChart data={data.vencimentosPorMes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonutChart data={data.statusBreakdown} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data.rankingLabel} que precisam de atenção</CardTitle>
        </CardHeader>
        <CardContent>
          <RankingConformidade items={data.ranking} label={data.rankingLabel} />
        </CardContent>
      </Card>
    </div>
  );
}
