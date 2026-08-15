import { UserRound } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FuncionarioRowActions } from "@/features/funcionarios/components/FuncionarioRowActions";
import { SITUACAO_FUNCIONARIO_LABEL } from "@/features/funcionarios/types";
import type { FuncionarioRow } from "@/lib/types/database.types";
import { Starburst } from "@/components/branding/Starburst";

export function FuncionariosTable({
  funcionarios,
  terceirizadaId,
}: {
  funcionarios: FuncionarioRow[];
  terceirizadaId: number;
}) {
  if (funcionarios.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border p-16 text-center">
        <Starburst className="size-10" />
        <div>
          <p className="font-medium text-foreground">Nenhum funcionário cadastrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre o primeiro funcionário dessa empresa.
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
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Nº inscrição</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funcionarios.map((funcionario) => (
            <TableRow key={funcionario.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-universo-black text-white">
                    <UserRound className="size-3.5" />
                  </span>
                  <div className="font-medium text-foreground">{funcionario.nome}</div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">{funcionario.cpf ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{funcionario.cargo ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {funcionario.numero_inscricao ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant={funcionario.situacao === "ativo" ? "success" : "outline"}>
                  {SITUACAO_FUNCIONARIO_LABEL[funcionario.situacao]}
                </Badge>
              </TableCell>
              <TableCell>
                <FuncionarioRowActions
                  funcionarioId={funcionario.id}
                  situacao={funcionario.situacao}
                  terceirizadaId={terceirizadaId}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
