import { Badge } from "@/components/ui/badge";
import { STATUS_PENDENCIA_LABEL } from "@/features/pendencias/types";
import type { StatusDocumentoEntregue } from "@/lib/types/database.types";

const VARIANT_POR_STATUS: Partial<Record<StatusDocumentoEntregue, "destructive" | "warning">> = {
  vencido: "destructive",
  a_vencer: "warning",
  faltando: "destructive",
};

export function PendenciaStatusBadge({ status }: { status: StatusDocumentoEntregue }) {
  return (
    <Badge variant={VARIANT_POR_STATUS[status] ?? "outline"}>
      {STATUS_PENDENCIA_LABEL[status] ?? status}
    </Badge>
  );
}
