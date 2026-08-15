import { Building2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmpresaStatusBadge } from "@/features/empresas/components/EmpresaStatusBadge";
import { EmpresaRowActions } from "@/features/empresas/components/EmpresaRowActions";
import { TIPO_EMPRESA_LABEL } from "@/features/empresas/types";
import type { EmpresaComPai } from "@/features/empresas/types";
import type { TipoEmpresa } from "@/lib/types/database.types";
import { initials } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { Starburst } from "@/components/branding/Starburst";

// Cor do avatar reforça o nível na hierarquia — não é decoração, é a mesma
// informação de "TIPO" só que reconhecível de relance na coluna da esquerda.
const TIPO_AVATAR_CLASS: Record<TipoEmpresa, string> = {
  proprietaria_saas: "bg-universo-black",
  contratante: "bg-universo-red",
  terceirizada: "bg-gradient-to-br from-universo-blue-from to-universo-blue-to",
};

export function EmpresasTable({ empresas }: { empresas: EmpresaComPai[] }) {
  if (empresas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border p-16 text-center">
        <Starburst className="size-10" />
        <div>
          <p className="font-medium text-foreground">Nenhuma empresa por aqui ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajuste os filtros ou cadastre a primeira empresa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Razão social</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Empresa-pai</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empresas.map((empresa) => (
            <TableRow key={empresa.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                      TIPO_AVATAR_CLASS[empresa.tipo]
                    )}
                  >
                    {empresa.tipo === "proprietaria_saas" ? (
                      <Building2 className="size-3.5" />
                    ) : (
                      initials(empresa.nome_fantasia)
                    )}
                  </span>
                  <div>
                    <div className="font-medium text-foreground">{empresa.nome_fantasia}</div>
                    <div className="text-xs text-muted-foreground">{empresa.razao_social}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">{empresa.cnpj}</TableCell>
              <TableCell>
                <Badge variant="secondary">{TIPO_EMPRESA_LABEL[empresa.tipo]}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {empresa.empresa_pai_nome ?? "—"}
              </TableCell>
              <TableCell>
                <EmpresaStatusBadge ativo={empresa.ativo} />
              </TableCell>
              <TableCell>
                <EmpresaRowActions
                  empresaId={empresa.id}
                  nomeFantasia={empresa.nome_fantasia}
                  ativo={empresa.ativo}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
