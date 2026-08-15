import { z } from "zod";

// Ver features/empresas/schema.ts: sem `.transform()` de propósito, pra não
// conflitar os generics entre zodResolver e useForm.
const optionalString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const tipoDocumentoSchema = z
  .object({
    codigo: optionalString(10),
    descricao: z.string().trim().min(1, "Informe o nome do documento.").max(255),
    periodicidade: z.enum(
      [
        "apresentar_uma_vez",
        "mensal",
        "competencia_anual",
        "informar_data_validade",
        "periodico_data_fixa",
        "periodico_a_partir_entrega",
      ],
      { error: "Selecione a periodicidade." }
    ),
    frequencia_meses: z.number().int().positive("Informe um número de meses válido.").optional(),
    formato_apresentacao: optionalString(100),
    funcao: z.string().trim().min(1, "Informe a função.").max(50),
    permitir_editar_entrega: z.boolean(),
    envia_email: z.boolean(),
    anexo_obrigatorio: z.boolean(),
    permite_isencao: z.boolean(),
    contabilizar_pontualidade: z.boolean(),
    ativo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.periodicidade === "periodico_a_partir_entrega" && !data.frequencia_meses) {
      ctx.addIssue({
        code: "custom",
        path: ["frequencia_meses"],
        message: "Informe a frequência em meses.",
      });
    }
  });

export type TipoDocumentoInput = z.infer<typeof tipoDocumentoSchema>;
