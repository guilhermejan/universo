import { z } from "zod";

const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const UF_REGEX = /^[A-Z]{2}$/;

// Sem `.transform()`: mantém o tipo de entrada igual ao de saída (string |
// undefined em ambos os lados), o que evita o conflito de generics entre
// zodResolver e useForm. A normalização "" -> null pra gravar no banco
// acontece em actions.ts, não aqui.
const optionalString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const empresaBaseFields = {
  razao_social: z.string().trim().min(1, "Informe a razão social.").max(255),
  nome_fantasia: z.string().trim().min(1, "Informe o nome fantasia.").max(150),
  cnpj: z
    .string()
    .trim()
    .regex(CNPJ_REGEX, "CNPJ inválido. Use o formato 00.000.000/0000-00."),
  inscricao_municipal: optionalString(30),
  inscricao_estadual: optionalString(30),

  endereco: optionalString(255),
  numero: optionalString(20),
  complemento: optionalString(100),
  bairro: optionalString(100),
  cidade: optionalString(100),
  estado: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || UF_REGEX.test(value), {
      message: "UF deve ter 2 letras.",
    }),
  cep: optionalString(10),

  responsavel_nome: optionalString(150),
  responsavel_email: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.email().safeParse(value).success, {
      message: "E-mail do responsável inválido.",
    }),
  responsavel_telefone: optionalString(20),
};

// Criação: tipo + empresa_pai_id entram na validação porque definem a
// hierarquia (checada de novo, com mais rigor, em actions.ts/scope.ts).
export const empresaCreateSchema = z
  .object({
    tipo: z.enum(["proprietaria_saas", "contratante", "terceirizada"], {
      error: "Selecione o tipo da empresa.",
    }),
    // Number puro (não z.coerce): o valor já chega como number do Controller
    // do Select (ver EmpresaCreateForm), então coagir de "unknown" só
    // reintroduz o mesmo problema de generics entre zodResolver e useForm
    // que as transformações de string->null também causavam.
    empresa_pai_id: z.number().int().positive().optional(),
    ...empresaBaseFields,
  })
  .superRefine((data, ctx) => {
    if (data.tipo === "proprietaria_saas" && data.empresa_pai_id) {
      ctx.addIssue({
        code: "custom",
        path: ["empresa_pai_id"],
        message: "A UNIVERSO não pode ter empresa-pai.",
      });
    }

    if (data.tipo !== "proprietaria_saas" && !data.empresa_pai_id) {
      ctx.addIssue({
        code: "custom",
        path: ["empresa_pai_id"],
        message: "Selecione a empresa-pai.",
      });
    }
  });

// Edição: tipo e empresa_pai_id são fixos após a criação (reparentar/mudar o
// nível de uma empresa é uma operação sensível demais para o MVP — não tem
// campo editável para isso na UI).
export const empresaUpdateSchema = z.object(empresaBaseFields);

export type EmpresaCreateInput = z.infer<typeof empresaCreateSchema>;
export type EmpresaUpdateInput = z.infer<typeof empresaUpdateSchema>;
