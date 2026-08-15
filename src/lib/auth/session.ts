import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { UsuarioRow } from "@/lib/types/database.types";

export type UsuarioProfile = UsuarioRow;

// cache() garante que, dentro da mesma request (RSC + layout + página), o
// perfil só é buscado uma vez.
export const getUsuarioProfile = cache(async (): Promise<UsuarioProfile | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  return (usuario as UsuarioRow | null) ?? null;
});

// Usado no layout autenticado: garante usuário logado, com perfil ativo.
// O proxy já redireciona quem não tem sessão, mas revalida aqui porque um
// perfil ausente/inativo não é algo que o proxy (que só olha auth.users)
// consegue detectar sozinho.
export async function requireUsuario(): Promise<UsuarioProfile> {
  const usuario = await getUsuarioProfile();

  if (!usuario || !usuario.ativo) {
    redirect("/login");
  }

  return usuario;
}
