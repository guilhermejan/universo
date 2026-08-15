import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Client de servidor (Server Actions / Server Components): usa a anon key +
// cookies da sessão. Suficiente para auth.getUser() e para ler o próprio
// registro em `usuarios` (protegido pela policy usuarios_select_own).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // chamado a partir de um Server Component (sem permissão de escrita);
            // o proxy.ts já cuida de renovar a sessão nesse caso.
          }
        },
      },
    }
  );
}
