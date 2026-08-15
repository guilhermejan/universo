import Image from "next/image";

import { cn } from "@/lib/utils";

// Recorte justo do logo oficial (public/logo-universo.png), sem a moldura
// transparente ao redor — mesma arte, só sem espaço morto, pra caber bem em
// espaços pequenos (sidebar, menu mobile) além do card de login.
function Logo({
  className,
  width = 170,
  height = 84,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src="/logo-universo-tight.png"
      alt="UNIVERSO"
      width={width}
      height={height}
      priority
      unoptimized
      style={{ width, height }}
      className={cn("object-contain", className)}
    />
  );
}

export { Logo };
