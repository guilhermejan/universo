import { Users } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GrupoRowActions } from "@/features/grupos/components/GrupoRowActions";
import type { GrupoTerceiroRow } from "@/lib/types/database.types";
import { Starburst } from "@/components/branding/Starburst";

export function GruposTable({
  grupos,
  contratanteId,
}: {
  grupos: GrupoTerceiroRow[];
  contratanteId: number;
}) {
  if (grupos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border p-16 text-center">
        <Starburst className="size-10" />
        <div>
          <p className="font-medium text-foreground">Nenhum grupo cadastrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Grupos classificam as empresas terceirizadas dessa contratante (ex: &quot;Prestadores de
            serviço&quot;).
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
            <TableHead>Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grupos.map((grupo) => (
            <TableRow key={grupo.id}>
              <TableCell className="font-mono text-xs">{grupo.codigo ?? "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-universo-black text-white">
                    <Users className="size-3.5" />
                  </span>
                  <div className="font-medium text-foreground">{grupo.nome}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={grupo.ativo ? "success" : "outline"}>
                  {grupo.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <GrupoRowActions grupoId={grupo.id} ativo={grupo.ativo} contratanteId={contratanteId} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
