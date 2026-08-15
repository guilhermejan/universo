import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getVisibleEmpresaIds } from "@/lib/auth/permissions";
import type { UsuarioProfile } from "@/lib/auth/session";
import type { DashboardData, StatusBreakdownItem, VencimentoMes, RankingItem } from "@/features/dashboard/types";

const STATUS_LABEL: Record<StatusBreakdownItem["status"], string> = {
  valido: "Válido",
  entregue_a_conferir: "A conferir",
  a_vencer: "A vencer",
  vencido: "Vencido",
  faltando: "Faltando",
};

const MES_LABEL = [
  "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez",
];

function chaveCompetencia(date: Date): string {
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  return `${mes}/${date.getFullYear()}`;
}

export async function getDashboardData(usuario: UsuarioProfile): Promise<DashboardData> {
  const admin = createAdminClient();
  const visiveis = await getVisibleEmpresaIds(usuario);

  // Empresas relevantes: terceirizadas (sempre) + contratantes (só quem
  // enxerga mais de uma, i.e. admin_plataforma).
  let empresasQuery = admin
    .from("empresas")
    .select("id, nome_fantasia, tipo, empresa_pai_id, ativo");
  if (visiveis !== "all") {
    empresasQuery = empresasQuery.in("id", visiveis);
  }
  const { data: empresasData, error: erroEmpresas } = await empresasQuery;
  if (erroEmpresas) throw erroEmpresas;
  const empresas = (empresasData ?? []) as {
    id: number;
    nome_fantasia: string;
    tipo: string;
    empresa_pai_id: number | null;
    ativo: boolean;
  }[];

  const terceirizadas = empresas.filter((e) => e.tipo === "terceirizada" && e.ativo);
  const terceirizadaIds = terceirizadas.map((e) => e.id);

  // admin_plataforma enxerga contratantes de verdade nesse conjunto;
  // admin_contratante/gestor_contrato só teriam a própria (visiveis inclui
  // usuario.empresa_id), o que não rende ranking útil por contratante —
  // nesse caso o ranking vira por terceirizada.
  const contratantes = empresas.filter((e) => e.tipo === "contratante" && e.ativo);
  const usarRankingPorContratante = usuario.papel === "admin_plataforma" && contratantes.length > 0;

  const [funcionariosRes, documentosRes] = await Promise.all([
    terceirizadaIds.length > 0
      ? admin
          .from("funcionarios")
          .select("id", { count: "exact", head: true })
          .eq("situacao", "ativo")
          .in("empresa_terceirizada_id", terceirizadaIds)
      : Promise.resolve({ count: 0, error: null }),
    terceirizadaIds.length > 0
      ? admin
          .from("documentos_entregues")
          .select("empresa_terceirizada_id, status, data_validade")
          .in("empresa_terceirizada_id", terceirizadaIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (funcionariosRes.error) throw funcionariosRes.error;
  if (documentosRes.error) throw documentosRes.error;

  const documentos = (documentosRes.data ?? []) as {
    empresa_terceirizada_id: number;
    status: StatusBreakdownItem["status"];
    data_validade: string | null;
  }[];

  const contagemStatus: Record<StatusBreakdownItem["status"], number> = {
    valido: 0,
    entregue_a_conferir: 0,
    a_vencer: 0,
    vencido: 0,
    faltando: 0,
  };
  for (const doc of documentos) {
    contagemStatus[doc.status] = (contagemStatus[doc.status] ?? 0) + 1;
  }

  const totalDocumentos = documentos.length;
  const conformidadePercent =
    totalDocumentos > 0 ? Math.round((contagemStatus.valido / totalDocumentos) * 100) : 100;

  const statusBreakdown: StatusBreakdownItem[] = (
    Object.keys(STATUS_LABEL) as StatusBreakdownItem["status"][]
  ).map((status) => ({ status, label: STATUS_LABEL[status], count: contagemStatus[status] }));

  // Próximos 6 meses (incluindo o atual): quantos documentos com
  // data_validade cai ali e ainda não estão resolvidos (valido/a_vencer —
  // o que já é 'vencido'/'faltando' entra nos KPIs, não nessa projeção).
  const hoje = new Date();
  const meses: { chave: string; label: string; ano: number; mes: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    meses.push({
      chave: chaveCompetencia(d),
      label: `${MES_LABEL[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      ano: d.getFullYear(),
      mes: d.getMonth(),
    });
  }

  const vencimentosPorMes: VencimentoMes[] = meses.map(({ chave, label, ano, mes }) => {
    const count = documentos.filter((doc) => {
      if (!doc.data_validade || (doc.status !== "valido" && doc.status !== "a_vencer")) return false;
      const dv = new Date(`${doc.data_validade}T00:00:00`);
      return dv.getFullYear() === ano && dv.getMonth() === mes;
    }).length;
    return { chave, label, count };
  });

  // Ranking: agrupa por contratante (admin_plataforma) ou por terceirizada
  // (demais papéis) e ordena pelas piores taxas de conformidade primeiro —
  // é a lista de "quem precisa de atenção agora".
  const grupoPorEmpresaId = new Map<number, { nome: string; docs: typeof documentos }>();

  if (usarRankingPorContratante) {
    const contratantePorTerceirizada = new Map<number, number>();
    for (const t of terceirizadas) {
      if (t.empresa_pai_id) contratantePorTerceirizada.set(t.id, t.empresa_pai_id);
    }
    for (const c of contratantes) {
      grupoPorEmpresaId.set(c.id, { nome: c.nome_fantasia, docs: [] });
    }
    for (const doc of documentos) {
      const contratanteId = contratantePorTerceirizada.get(doc.empresa_terceirizada_id);
      if (contratanteId && grupoPorEmpresaId.has(contratanteId)) {
        grupoPorEmpresaId.get(contratanteId)!.docs.push(doc);
      }
    }
  } else {
    for (const t of terceirizadas) {
      grupoPorEmpresaId.set(t.id, { nome: t.nome_fantasia, docs: [] });
    }
    for (const doc of documentos) {
      grupoPorEmpresaId.get(doc.empresa_terceirizada_id)?.docs.push(doc);
    }
  }

  const ranking: RankingItem[] = [...grupoPorEmpresaId.entries()]
    .map(([id, { nome, docs }]) => {
      const total = docs.length;
      const validos = docs.filter((d) => d.status === "valido").length;
      const vencidos = docs.filter((d) => d.status === "vencido").length;
      const faltando = docs.filter((d) => d.status === "faltando").length;
      return {
        id,
        nome,
        conformidadePercent: total > 0 ? Math.round((validos / total) * 100) : 100,
        vencidos,
        faltando,
        totalExigido: total,
      };
    })
    .filter((r) => r.totalExigido > 0)
    .sort((a, b) => a.conformidadePercent - b.conformidadePercent)
    .slice(0, 6);

  return {
    kpis: {
      contratantesAtivas: usuario.papel === "admin_plataforma" ? contratantes.length : null,
      terceirizadasAtivas: terceirizadas.length,
      funcionariosAtivos: funcionariosRes.count ?? 0,
      documentosVencidos: contagemStatus.vencido,
      documentosAVencer: contagemStatus.a_vencer,
      documentosFaltando: contagemStatus.faltando,
      conformidadePercent,
    },
    statusBreakdown,
    vencimentosPorMes,
    ranking,
    rankingLabel: usarRankingPorContratante ? "Contratantes" : "Terceirizadas",
  };
}
