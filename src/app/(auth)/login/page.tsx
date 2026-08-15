import { Logo } from "@/components/branding/Logo";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative w-full max-w-md animate-fade-in-up overflow-hidden rounded-2xl border border-border bg-white p-10 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-universo-blue-from to-universo-blue-to" />

      <div className="mb-10 flex flex-col items-center gap-5 text-center">
        <Logo width={240} height={118} />
        <div>
          <h1 className="font-display text-2xl font-semibold text-universo-black">
            Acessar plataforma
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Entre com seu e-mail e senha
          </p>
        </div>
      </div>

      <LoginForm />
    </div>
  );
}
