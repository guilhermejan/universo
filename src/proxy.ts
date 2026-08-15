import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Renomeado de middleware.ts para proxy.ts no Next.js 16 (mesma função,
// convenção de arquivo/nome de export diferente).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|logo-universo.png|logo-universo-tight.png|auth/callback).*)",
  ],
};
