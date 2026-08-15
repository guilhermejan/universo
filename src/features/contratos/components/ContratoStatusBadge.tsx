import { Badge } from "@/components/ui/badge";
import { STATUS_CONTRATO_LABEL } from "@/features/contratos/types";
import type { StatusContrato } from "@/lib/types/database.types";

const VARIANT: Record<StatusContrato, "success" | "destructive" | "outline"> = {
  ativo: "success",
  vencido: "destructive",
  encerrado: "outline",
};

export function ContratoStatusBadge({ status }: { status: StatusContrato }) {
  return <Badge variant={VARIANT[status]}>{STATUS_CONTRATO_LABEL[status]}</Badge>;
}
