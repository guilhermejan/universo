import { z } from "zod";

export const contratoSchema = z
  .object({
    empresa_terceirizada_id: z.number().int().positive({ message: "Selecione a terceirizada." }),
    gestor_contrato_usuario_id: z.string().optional().or(z.literal("")),
    numero_contrato: z.string().trim().max(50).optional().or(z.literal("")),
    data_inicio: z.string().optional().or(z.literal("")),
    data_fim: z.string().optional().or(z.literal("")),
    status: z.enum(["ativo", "vencido", "encerrado"]),
  })
  .superRefine((data, ctx) => {
    if (data.data_inicio && data.data_fim && data.data_fim < data.data_inicio) {
      ctx.addIssue({
        code: "custom",
        path: ["data_fim"],
        message: "A data de fim não pode ser anterior à data de início.",
      });
    }
  });

export type ContratoInput = z.infer<typeof contratoSchema>;
