import { z } from "zod";

export const perfilParametrizacaoSchema = z.object({
  tipo_entidade: z.enum(["contrato", "empresa", "funcionario"], {
    error: "Selecione o tipo.",
  }),
  codigo: z.string().trim().max(10).optional().or(z.literal("")),
  descricao: z.string().trim().min(1, "Informe a descrição.").max(255),
  nivel_aprovacao: z.enum(["nenhum", "gestor_contrato", "admin_contratante"]),
  modo_cadastro: z.string().trim().max(100).optional().or(z.literal("")),
});

export type PerfilParametrizacaoInput = z.infer<typeof perfilParametrizacaoSchema>;
