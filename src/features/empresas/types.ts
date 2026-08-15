import type { EmpresaRow, TipoEmpresa } from "@/lib/types/database.types";

export type { TipoEmpresa };

export type EmpresaComPai = EmpresaRow & {
  empresa_pai_nome: string | null;
};

export const TIPO_EMPRESA_LABEL: Record<TipoEmpresa, string> = {
  proprietaria_saas: "UNIVERSO (plataforma)",
  contratante: "Contratante",
  terceirizada: "Terceirizada",
};
