import type { TipoDocumentoRow, PeriodicidadeDocumento } from "@/lib/types/database.types";

export type { TipoDocumentoRow, PeriodicidadeDocumento };

export const PERIODICIDADE_LABEL: Record<PeriodicidadeDocumento, string> = {
  apresentar_uma_vez: "Apresentar uma vez",
  mensal: "Mensal",
  competencia_anual: "Competência anual",
  informar_data_validade: "Informar data de validade",
  periodico_data_fixa: "Periódico (data fixa)",
  periodico_a_partir_entrega: "Periódico a partir da data de entrega",
};

export const PERIODICIDADE_OPCOES = Object.keys(PERIODICIDADE_LABEL) as PeriodicidadeDocumento[];
