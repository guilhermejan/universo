import type { ContratoRow, StatusContrato } from "@/lib/types/database.types";

export type { ContratoRow, StatusContrato };

export type ContratoComRelacoes = ContratoRow & {
  terceirizada_nome: string;
  gestor_nome: string | null;
};

export const STATUS_CONTRATO_LABEL: Record<StatusContrato, string> = {
  ativo: "Ativo",
  vencido: "Vencido",
  encerrado: "Encerrado",
};

export const STATUS_CONTRATO_OPCOES = Object.keys(STATUS_CONTRATO_LABEL) as StatusContrato[];
