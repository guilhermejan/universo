import { Badge } from "@/components/ui/badge";

export function EmpresaStatusBadge({ ativo }: { ativo: boolean }) {
  return (
    <Badge variant={ativo ? "success" : "outline"}>
      {ativo ? "Ativa" : "Inativa"}
    </Badge>
  );
}
