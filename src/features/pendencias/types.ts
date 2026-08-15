import type { PeriodicidadeDocumento, StatusDocumentoEntregue } from "@/lib/types/database.types";

export type TipoPendencia = "empresa" | "funcionario";

export type PendenciaItem = {
  id: number;
  tipo: TipoPendencia;
  nome: string;
  empresaId: number;
  empresaNome: string;
  tipoDocumentoId: number;
  tipoDocumentoCodigo: string;
  tipoDocumentoDescricao: string;
  periodicidade: PeriodicidadeDocumento;
  frequenciaMeses: number | null;
  competencia: string | null;
  dataValidade: string | null;
  status: StatusDocumentoEntregue;
};

export type PendenciaFilters = {
  empresaId?: number;
  tipoDocumentoId?: number;
  competencia?: string;
};

export const STATUS_PENDENCIA_LABEL: Record<string, string> = {
  vencido: "VENCIDO",
  a_vencer: "A VENCER",
  faltando: "FALTA",
};
