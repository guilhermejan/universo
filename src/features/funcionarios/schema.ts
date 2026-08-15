import { z } from "zod";

// Validação de dígito verificador real (não só formato) — evita CPF
// obviamente inválido/de teste (111.111.111-11 etc) entrando no cadastro.
function cpfValido(cpfFormatado: string): boolean {
  const digits = cpfFormatado.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  function digitoVerificador(base: string, pesoInicial: number): number {
    const soma = base
      .split("")
      .reduce((acc, digit, i) => acc + Number(digit) * (pesoInicial - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  }

  const d1 = digitoVerificador(digits.slice(0, 9), 10);
  const d2 = digitoVerificador(digits.slice(0, 10), 11);
  return d1 === Number(digits[9]) && d2 === Number(digits[10]);
}

export const funcionarioSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome.").max(150),
  cpf: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || cpfValido(value), { message: "CPF inválido." }),
  numero_inscricao: z.string().trim().max(30).optional().or(z.literal("")),
  cargo: z.string().trim().max(100).optional().or(z.literal("")),
  situacao: z.enum(["ativo", "desligado"]),
});

export type FuncionarioInput = z.infer<typeof funcionarioSchema>;
