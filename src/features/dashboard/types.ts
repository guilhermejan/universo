export type StatusBreakdownItem = {
  status: "valido" | "entregue_a_conferir" | "a_vencer" | "vencido" | "faltando";
  label: string;
  count: number;
};

export type VencimentoMes = {
  chave: string; // "MM/AAAA"
  label: string; // "jan/26"
  count: number;
};

export type RankingItem = {
  id: number;
  nome: string;
  conformidadePercent: number;
  vencidos: number;
  faltando: number;
  totalExigido: number;
};

export type DashboardData = {
  kpis: {
    contratantesAtivas: number | null;
    terceirizadasAtivas: number;
    funcionariosAtivos: number;
    documentosVencidos: number;
    documentosAVencer: number;
    documentosFaltando: number;
    conformidadePercent: number;
  };
  statusBreakdown: StatusBreakdownItem[];
  vencimentosPorMes: VencimentoMes[];
  ranking: RankingItem[];
  rankingLabel: string;
};
