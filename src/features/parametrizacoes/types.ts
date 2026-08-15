import type {
  ParametrizacaoAgrupamentoRow,
  ParametrizacaoParametroRow,
  ParametrizacaoPerfilRow,
  TipoEntidadeParametrizacao,
  NivelAprovacao,
} from "@/lib/types/database.types";

export type {
  ParametrizacaoAgrupamentoRow,
  ParametrizacaoParametroRow,
  ParametrizacaoPerfilRow,
  TipoEntidadeParametrizacao,
  NivelAprovacao,
};

export const TIPO_ENTIDADE_LABEL: Record<TipoEntidadeParametrizacao, string> = {
  contrato: "Parametrização de contrato",
  empresa: "Parametrização de empresa",
  funcionario: "Parametrização de funcionário",
};

export const TIPO_ENTIDADE_OPCOES = Object.keys(TIPO_ENTIDADE_LABEL) as TipoEntidadeParametrizacao[];

export const NIVEL_APROVACAO_LABEL: Record<NivelAprovacao, string> = {
  nenhum: "Nenhum",
  gestor_contrato: "Gestor de contrato",
  admin_contratante: "Admin contratante",
};

export const NIVEL_APROVACAO_OPCOES = Object.keys(NIVEL_APROVACAO_LABEL) as NivelAprovacao[];
