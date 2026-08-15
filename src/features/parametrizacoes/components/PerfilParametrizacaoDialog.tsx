"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  createPerfilParametrizacaoAction,
  updatePerfilParametrizacaoAction,
} from "@/features/parametrizacoes/actions";
import { TIPO_ENTIDADE_LABEL, TIPO_ENTIDADE_OPCOES, NIVEL_APROVACAO_LABEL, NIVEL_APROVACAO_OPCOES } from "@/features/parametrizacoes/types";
import type { ParametrizacaoPerfilRow, TipoEntidadeParametrizacao, NivelAprovacao } from "@/lib/types/database.types";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function PerfilParametrizacaoDialog({
  parametroId,
  contratanteId,
  perfil,
}: {
  parametroId: number;
  contratanteId: number;
  perfil?: ParametrizacaoPerfilRow;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoEntidade, setTipoEntidade] = useState<TipoEntidadeParametrizacao>(
    perfil?.tipo_entidade ?? "empresa"
  );
  const [codigo, setCodigo] = useState(perfil?.codigo ?? "");
  const [descricao, setDescricao] = useState(perfil?.descricao ?? "");
  const [nivelAprovacao, setNivelAprovacao] = useState<NivelAprovacao>(
    perfil?.nivel_aprovacao ?? "nenhum"
  );
  const [modoCadastro, setModoCadastro] = useState(perfil?.modo_cadastro ?? "");

  async function onSubmit() {
    if (!descricao.trim()) {
      toast.error("Informe a descrição.");
      return;
    }

    setIsSubmitting(true);
    const input = {
      tipo_entidade: tipoEntidade,
      codigo,
      descricao,
      nivel_aprovacao: nivelAprovacao,
      modo_cadastro: modoCadastro,
    };
    const result = perfil
      ? await updatePerfilParametrizacaoAction(perfil.id, contratanteId, input)
      : await createPerfilParametrizacaoAction(parametroId, contratanteId, input);
    setIsSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(perfil ? "Perfil atualizado." : "Perfil criado.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {perfil ? (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          Editar
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus />
          Novo
        </Button>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{perfil ? "Editar perfil" : "Novo perfil de parametrização"}</DialogTitle>
          <DialogDescription>
            Define o nível de aprovação e o modo de cadastro para esse tipo de parametrização.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Tipo</Label>
            <Select
              value={tipoEntidade}
              onValueChange={(value) => setTipoEntidade(value as TipoEntidadeParametrizacao)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPO_ENTIDADE_OPCOES.map((opcao) => (
                  <SelectItem key={opcao} value={opcao}>
                    {TIPO_ENTIDADE_LABEL[opcao]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                placeholder="Auto"
                maxLength={10}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5 col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                maxLength={255}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Nível de aprovação</Label>
            <Select
              value={nivelAprovacao}
              onValueChange={(value) => setNivelAprovacao(value as NivelAprovacao)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NIVEL_APROVACAO_OPCOES.map((opcao) => (
                  <SelectItem key={opcao} value={opcao}>
                    {NIVEL_APROVACAO_LABEL[opcao]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="modo_cadastro">Modo de cadastro</Label>
            <Input
              id="modo_cadastro"
              placeholder="Opcional"
              maxLength={100}
              value={modoCadastro}
              onChange={(e) => setModoCadastro(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {perfil ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
