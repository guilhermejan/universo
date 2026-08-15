import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Endpoint de retorno para links de e-mail do Supabase Auth (recuperação de
// senha, convite). Não usado no fluxo de login por e-mail/senha do MVP, mas
// precisa existir para esses links não quebrarem quando forem habilitados.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
