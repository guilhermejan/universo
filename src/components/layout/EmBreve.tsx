import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Starburst } from "@/components/branding/Starburst";
import { Button } from "@/components/ui/button";

export function EmBreve({
  modulo,
  descricao,
}: {
  modulo: string;
  descricao: string;
}) {
  return (
    <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-5 text-center">
      <Starburst className="size-14" />
      <div>
        <h1 className="font-display text-xl font-semibold text-universo-black">{modulo}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{descricao}</p>
      </div>
      <Button variant="outline" asChild>
        <Link href="/empresas">
          Ir para Empresas
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
