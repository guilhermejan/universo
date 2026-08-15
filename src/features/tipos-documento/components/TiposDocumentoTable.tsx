import { FileText } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TipoDocumentoRowActions } from "@/features/tipos-documento/components/TipoDocumentoRowActions";
import { PERIODICIDADE_LABEL } from "@/features/tipos-documento/types";
import type { TipoDocumentoRow } from "@/lib/types/database.types";
import { Starburst } from "@/components/branding/Starburst";

export function TiposDocumentoTable({
  tipos,
  contratanteId,
}: {
  tipos: TipoDocumentoRow[];
  contratanteId: number;
}) {
  if (tipos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border p-16 text-center">
        <Starburst className="size-10" />
        <div>
          <p className="font-medium text-foreground">Nenhum tipo de documento cadastrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre o primeiro documento da biblioteca dessa contratante.
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
            <TableHead>Documento</TableHead>
            <TableHead>Periodicidade</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tipos.map((tipo) => (
            <TableRow key={tipo.id}>
              <TableCell className="font-mono text-xs">{tipo.codigo}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-universo-black text-white">
                    <FileText className="size-3.5" />
                  </span>
                  <div className="font-medium text-foreground">{tipo.descricao}</div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {PERIODICIDADE_LABEL[tipo.periodicidade]}
                {tipo.periodicidade === "periodico_a_partir_entrega" && tipo.frequencia_meses && (
                  <span className="text-xs"> ({tipo.frequencia_meses}m)</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{tipo.funcao}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={tipo.ativo ? "success" : "outline"}>
                  {tipo.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <TipoDocumentoRowActions
                  tipoId={tipo.id}
                  ativo={tipo.ativo}
                  contratanteId={contratanteId}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
