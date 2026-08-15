"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { loginAction, type LoginActionState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const initialState: LoginActionState = null;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com"
          required
          className="h-11"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Senha</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          className="h-11"
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-status-vencido/10 px-3 py-2 text-sm text-status-vencido">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="mt-1 h-11 w-full text-base">
        {isPending && <Loader2 className="animate-spin" />}
        Entrar
      </Button>
    </form>
  );
}
