import { FileSignature, Pencil } from "lucide-react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ContratoStatusBadge } from "@/features/contratos/components/ContratoStatusBadge";
import { formatDateBr } from "@/lib/utils/format";
import type { ContratoComRelacoes } from "@/features/contratos/types";
import { Starburst } from "@/components/branding/Starburst";

export function ContratosTable({
  contratos,
  contratanteId,
}: {
  contratos: ContratoComRelacoes[];
  contratanteId: number;
}) {
  if (contratos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border p-16 text-center">
        <Starburst className="size-10" />
        <div>
          <p className="font-medium text-foreground">Nenhum contrato cadastrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Formalize o vínculo com uma terceirizada dessa contratante.
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
            <TableHead>Nº contrato</TableHead>
            <TableHead>Terceirizada</TableHead>
            <TableHead>Gestor</TableHead>
            <TableHead>Vigência</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contratos.map((contrato) => (
            <TableRow key={contrato.id}>
              <TableCell className="font-mono text-xs">{contrato.numero_contrato ?? "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-universo-black text-white">
                    <FileSignature className="size-3.5" />
                  </span>
                  <div className="font-medium text-foreground">{contrato.terceirizada_nome}</div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{contrato.gestor_nome ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateBr(contrato.data_inicio)} — {formatDateBr(contrato.data_fim)}
              </TableCell>
              <TableCell>
                <ContratoStatusBadge status={contrato.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/contratos/${contrato.id}/editar?contratante_id=${contratanteId}`}>
                    <Pencil />
                    <span className="sr-only">Editar</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
