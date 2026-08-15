import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PendenciaStatusBadge } from "@/features/pendencias/components/PendenciaStatusBadge";
import { PERIODICIDADE_LABEL } from "@/features/tipos-documento/types";
import type { PendenciaItem } from "@/features/pendencias/types";
import { formatDateBr } from "@/lib/utils/format";
import { Starburst } from "@/components/branding/Starburst";

export function PendenciasTable({
  itens,
  selecionados,
  onToggle,
  onToggleTodos,
}: {
  itens: PendenciaItem[];
  selecionados: Set<number>;
  onToggle: (id: number) => void;
  onToggleTodos: (marcar: boolean) => void;
}) {
  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border p-16 text-center">
        <Starburst className="size-10" />
        <div>
          <p className="font-medium text-foreground">Nenhuma pendência encontrada</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajuste os filtros ou aproveite — pode ser que esteja tudo em dia.
          </p>
        </div>
      </div>
    );
  }

  const todosMarcados = itens.every((item) => selecionados.has(item.id));

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={todosMarcados}
                onCheckedChange={(checked) => onToggleTodos(checked === true)}
                aria-label="Selecionar todos"
              />
            </TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Frequência</TableHead>
            <TableHead>Competência</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itens.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  checked={selecionados.has(item.id)}
                  onCheckedChange={() => onToggle(item.id)}
                  aria-label={`Selecionar pendência de ${item.nome}`}
                />
              </TableCell>
              <TableCell>
                <Badge variant={item.tipo === "empresa" ? "secondary" : "outline"}>
                  {item.tipo === "empresa" ? "Empresa" : "Funcionário"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-medium text-foreground">{item.nome}</div>
                {item.tipo === "funcionario" && (
                  <div className="text-xs text-muted-foreground">{item.empresaNome}</div>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {item.tipoDocumentoDescricao}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {PERIODICIDADE_LABEL[item.periodicidade]}
                {item.periodicidade === "periodico_a_partir_entrega" && item.frequenciaMeses && (
                  <span className="text-xs"> ({item.frequenciaMeses}m)</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{item.competencia ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateBr(item.dataValidade)}
              </TableCell>
              <TableCell>
                <PendenciaStatusBadge status={item.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
