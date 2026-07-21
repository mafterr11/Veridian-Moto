"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";

import { loginAction, type LoginActionState } from "@/app/atelier/actions";
import { Button } from "@/components/ui/button";

const initialLoginState: LoginActionState = { status: "idle" };

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialLoginState,
  );

  return (
    <form action={formAction} className="mt-8 grid gap-5" noValidate>
      <div className="grid gap-2">
        <label
          htmlFor="admin-email"
          className="text-xs font-bold tracking-[0.14em] uppercase"
        >
          Email administrator
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          disabled={!configured || pending}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={
            state.fieldErrors?.email ? "admin-email-error" : undefined
          }
          className="border-border bg-background focus:border-primary h-12 border px-4 text-sm outline-none disabled:opacity-50"
        />
        {state.fieldErrors?.email && (
          <p id="admin-email-error" className="text-destructive text-sm">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="admin-password"
          className="text-xs font-bold tracking-[0.14em] uppercase"
        >
          Parolă
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          disabled={!configured || pending}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={
            state.fieldErrors?.password ? "admin-password-error" : undefined
          }
          className="border-border bg-background focus:border-primary h-12 border px-4 text-sm outline-none disabled:opacity-50"
        />
        {state.fieldErrors?.password && (
          <p id="admin-password-error" className="text-destructive text-sm">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      {state.message && (
        <div
          role="alert"
          className={
            state.status === "configuration-error"
              ? "border-signal-amber/40 bg-signal-amber/10 text-signal-amber border p-3 text-sm leading-6"
              : "border-destructive/40 bg-destructive/10 text-destructive border p-3 text-sm leading-6"
          }
        >
          {state.message}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={!configured || pending}
        className="mt-1 w-full"
      >
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden="true" />
            Se verifică
          </>
        ) : (
          <>
            <LockKeyhole aria-hidden="true" />
            Intră în atelier
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}
