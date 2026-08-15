import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { UsuarioProfile } from "@/lib/auth/session";
import type { TipoEmpresa } from "@/lib/types/database.types";

export type EmpresaFormContext = {
  tiposPermitidos: TipoEmpresa[];
  universoId: number | null;
  contratantesDisponiveis: { id: number; nome_fantasia: string }[];
  empresaPaiFixa: number | null;
  empresaPaiFixaNome: string | null;
};

// Define, por papel, quais `tipo` de empresa o usuário pode criar e de onde
// vem o `empresa_pai_id`:
// - admin_plataforma: cria contratante (pai = UNIVERSO, fixo) ou terceirizada
//   (escolhe a contratante-pai); só cria proprietaria_saas se ainda não existir.
// - admin_contratante / gestor_contrato: só cria terceirizada, sempre com
//   pai = a própria empresa (fixo, não escolhe).
// - terceiro: não cria empresas.
export async function getEmpresaFormContext(
  usuario: UsuarioProfile
): Promise<EmpresaFormContext> {
  const admin = createAdminClient();

  if (usuario.papel === "admin_plataforma") {
    const { data: universo } = (await admin
      .from("empresas")
      .select("id")
      .eq("tipo", "proprietaria_saas")
      .maybeSingle()) as { data: { id: number } | null };

    const { data: contratantes } = (await admin
      .from("empresas")
      .select("id, nome_fantasia")
      .eq("tipo", "contratante")
      .eq("ativo", true)
      .order("nome_fantasia")) as { data: { id: number; nome_fantasia: string }[] | null };

    return {
      tiposPermitidos: universo
        ? ["contratante", "terceirizada"]
        : ["proprietaria_saas", "contratante", "terceirizada"],
      universoId: universo?.id ?? null,
      contratantesDisponiveis: contratantes ?? [],
      empresaPaiFixa: null,
      empresaPaiFixaNome: null,
    };
  }

  if (usuario.papel === "admin_contratante" || usuario.papel === "gestor_contrato") {
    const { data: propriaEmpresa } = (await admin
      .from("empresas")
      .select("nome_fantasia")
      .eq("id", usuario.empresa_id)
      .single()) as { data: { nome_fantasia: string } | null };

    return {
      tiposPermitidos: ["terceirizada"],
      universoId: null,
      contratantesDisponiveis: [],
      empresaPaiFixa: usuario.empresa_id,
      empresaPaiFixaNome: propriaEmpresa?.nome_fantasia ?? null,
    };
  }

  return {
    tiposPermitidos: [],
    universoId: null,
    contratantesDisponiveis: [],
    empresaPaiFixa: null,
    empresaPaiFixaNome: null,
  };
}
