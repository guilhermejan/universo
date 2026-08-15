import { createBrowserClient } from "@supabase/ssr";

// Client de browser: usado só para signInWithPassword/signOut no formulário
// de login. Nenhuma query de dado de tenant deve rodar por aqui.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
