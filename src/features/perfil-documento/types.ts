import type { PerfilDocumentoRow, PerfilDocumentalRow } from "@/lib/types/database.types";

export type { PerfilDocumentoRow, PerfilDocumentalRow };

export type VinculoPerfilDocumento = PerfilDocumentoRow & {
  tipo_documento_codigo: string;
  tipo_documento_descricao: string;
};
