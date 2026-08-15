import type { FuncionarioRow, SituacaoFuncionario } from "@/lib/types/database.types";

export type { FuncionarioRow, SituacaoFuncionario };

export const SITUACAO_FUNCIONARIO_LABEL: Record<SituacaoFuncionario, string> = {
  ativo: "Ativo",
  desligado: "Desligado",
};
