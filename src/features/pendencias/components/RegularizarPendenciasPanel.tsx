"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { regularizarPendenciasAction } from "@/features/pendencias/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RegularizarPendenciasPanel({
  selecionados,
  onConcluido,
}: {
  selecionados: number[];
  onConcluido: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [observacao, setObservacao] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function adicionarArquivos(novos: FileList | null) {
    if (!novos) return;
    setArquivos((atual) => [...atual, ...Array.from(novos)]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removerArquivo(index: number) {
    setArquivos((atual) => atual.filter((_, i) => i !== index));
  }

  async function salvar() {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("itemIds", JSON.stringify(selecionados));
    formData.set("observacao", observacao);
    for (const arquivo of arquivos) {
      formData.append("arquivos", arquivo);
    }

    const result = await regularizarPendenciasAction(formData);
    setIsSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(
      selecionados.length === 1
        ? "Pendência regularizada e enviada pra conferência."
        : `${selecionados.length} pendências regularizadas e enviadas pra conferência.`
    );
    setObservacao("");
    setArquivos([]);
    onConcluido();
    router.refresh();
  }

  return (
    <Card className="border-universo-blue-to/40">
      <CardHeader>
        <CardTitle>Regularizar pendências selecionadas</CardTitle>
        <CardDescription>
          {selecionados.length}{" "}
          {selecionados.length === 1 ? "pendência selecionada" : "pendências selecionadas"} —
          grava a entrega e envia pra conferência.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="observacao">Observação</Label>
          <Textarea
            id="observacao"
            placeholder="Alguma observação sobre essa entrega..."
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <Label>Documentos digitalizados</Label>
          <div className="flex flex-wrap gap-2">
            {arquivos.map((arquivo, index) => (
              <span
                key={`${arquivo.name}-${index}`}
                className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-xs"
              >
                <Paperclip className="size-3" />
                {arquivo.name}
                <button
                  type="button"
                  onClick={() => removerArquivo(index)}
                  className="rounded-full p-0.5 hover:bg-border"
                  aria-label={`Remover ${arquivo.name}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => adicionarArquivos(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip />
            Anexar
          </Button>
        </div>

        <div className="flex justify-end">
          <Button onClick={salvar} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
