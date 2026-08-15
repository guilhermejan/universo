import { cn } from "@/lib/utils";

// Estrela extraída do logo, redesenhada como elemento vivo: brilho ambiente
// desfocado atrás + a marca geométrica nítida na frente. É a assinatura
// visual reaproveitada no login, na sidebar e nos estados vazios — em vez de
// só colar o PNG do logo em mais lugares.
export function Starburst({
  className,
  glow = true,
}: {
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      {glow && (
        <>
          <div
            className="absolute inset-[-40%] rounded-full opacity-70 blur-3xl motion-safe:animate-spin-slow"
            style={{
              background:
                "conic-gradient(from 90deg, var(--universo-blue-from), transparent 30%, var(--universo-blue-to) 60%, transparent 85%)",
            }}
          />
          <div
            className="absolute inset-[-15%] rounded-full opacity-60 blur-2xl motion-safe:animate-pulse-soft"
            style={{
              background:
                "radial-gradient(circle, var(--universo-blue-from) 0%, transparent 70%)",
            }}
          />
        </>
      )}
      <svg
        viewBox="0 0 100 100"
        className="relative size-full motion-safe:animate-pulse-soft"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="starburst-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--universo-blue-from)" />
            <stop offset="100%" stopColor="var(--universo-blue-to)" />
          </linearGradient>
        </defs>
        <path
          fill="url(#starburst-gradient)"
          d="M50,4 L56.12,35.22 L82.53,17.47 L64.78,43.88 L96,50 L64.78,56.12 L82.53,82.53 L56.12,64.78 L50,96 L43.88,64.78 L17.47,82.53 L35.22,56.12 L4,50 L35.22,43.88 L17.47,17.47 L43.88,35.22 Z"
        />
      </svg>
    </div>
  );
}
