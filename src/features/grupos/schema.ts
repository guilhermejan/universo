import { z } from "zod";

export const grupoSchema = z.object({
  codigo: z.string().trim().max(10).optional().or(z.literal("")),
  nome: z.string().trim().min(1, "Informe o nome do grupo.").max(150),
  ativo: z.boolean(),
});

export type GrupoInput = z.infer<typeof grupoSchema>;
