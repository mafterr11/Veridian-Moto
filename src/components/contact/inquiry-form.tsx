"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Send } from "lucide-react";

import {
  submitInquiryAction,
  type InquiryFormState,
} from "@/app/(public)/contact/actions";

const initialState: InquiryFormState = { status: "idle" };

export function InquiryForm({
  configurationReference,
  defaultSubject,
}: {
  configurationReference?: string;
  defaultSubject?: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitInquiryAction,
    initialState,
  );
  const startedAtRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAtRef.current) {
      startedAtRef.current.value = String(Date.now());
    }
  }, []);

  if (state.status === "success") {
    return (
      <div
        className="border-primary/40 bg-primary/10 mt-8 border p-6"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="text-primary size-8" aria-hidden="true" />
        <h3 className="font-heading mt-5 text-3xl font-bold uppercase">
          Solicitare înregistrată
        </h3>
        <p className="text-muted-foreground mt-3 leading-7">
          Referința ta este{" "}
          <strong className="text-porcelain">{state.reference}</strong>.
          Solicitarea rămâne în Atelier chiar dacă serviciul de email este
          temporar indisponibil.
        </p>
        <Link
          href="/modele"
          className="text-primary mt-5 inline-flex text-sm font-bold"
        >
          Înapoi la modele
        </Link>
      </div>
    );
  }

  const issue = (field: string) => state.issues?.[field];

  return (
    <form action={formAction} className="relative mt-8 grid gap-5" noValidate>
      <input
        ref={startedAtRef}
        type="hidden"
        name="startedAt"
        defaultValue=""
      />
      <div
        className="pointer-events-none absolute size-px overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {configurationReference && (
        <div className="border-primary/30 bg-primary/5 border p-4 text-sm">
          <p className="text-primary text-xs font-bold uppercase">
            Configurație atașată
          </p>
          <p className="mt-1 font-semibold">{configurationReference}</p>
          <input
            type="hidden"
            name="configurationReference"
            value={configurationReference}
          />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <PublicField
          label="Nume"
          error={issue("name")}
          errorId="inquiry-name-error"
        >
          <input
            name="name"
            autoComplete="name"
            maxLength={160}
            required
            aria-invalid={Boolean(issue("name"))}
            aria-describedby={issue("name") ? "inquiry-name-error" : undefined}
            className="border-border focus:border-primary h-12 w-full border bg-white/5 px-3 outline-none"
          />
        </PublicField>
        <PublicField
          label="Email"
          error={issue("email")}
          errorId="inquiry-email-error"
        >
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={320}
            required
            aria-invalid={Boolean(issue("email"))}
            aria-describedby={
              issue("email") ? "inquiry-email-error" : undefined
            }
            className="border-border focus:border-primary h-12 w-full border bg-white/5 px-3 outline-none"
          />
        </PublicField>
        <PublicField
          label="Telefon (opțional)"
          error={issue("phone")}
          errorId="inquiry-phone-error"
        >
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            aria-invalid={Boolean(issue("phone"))}
            aria-describedby={
              issue("phone") ? "inquiry-phone-error" : undefined
            }
            className="border-border focus:border-primary h-12 w-full border bg-white/5 px-3 outline-none"
          />
        </PublicField>
        <PublicField label="Contact preferat">
          <select
            name="preferredContactMethod"
            defaultValue="email"
            className="border-border focus:border-primary bg-obsidian h-12 w-full border px-3 outline-none"
          >
            <option value="email">Email</option>
            <option value="phone">Telefon</option>
          </select>
        </PublicField>
      </div>

      <PublicField
        label="Subiect"
        error={issue("subject")}
        errorId="inquiry-subject-error"
      >
        <input
          name="subject"
          defaultValue={defaultSubject ?? "Solicitare VERIDIAN Moto"}
          maxLength={200}
          required
          aria-invalid={Boolean(issue("subject"))}
          aria-describedby={
            issue("subject") ? "inquiry-subject-error" : undefined
          }
          className="border-border focus:border-primary h-12 w-full border bg-white/5 px-3 outline-none"
        />
      </PublicField>
      <PublicField
        label="Mesaj"
        error={issue("message")}
        errorId="inquiry-message-error"
      >
        <textarea
          name="message"
          rows={6}
          minLength={20}
          maxLength={5_000}
          required
          aria-invalid={Boolean(issue("message"))}
          aria-describedby={
            issue("message") ? "inquiry-message-error" : undefined
          }
          className="border-border focus:border-primary w-full resize-y border bg-white/5 p-3 outline-none"
          placeholder="Spune-ne ce model, configurație sau tip de drum te interesează."
        />
      </PublicField>

      <label className="flex items-start gap-3 text-sm leading-6 text-white/70">
        <input
          name="privacyAcknowledged"
          type="checkbox"
          required
          aria-invalid={Boolean(issue("privacyAcknowledged"))}
          aria-describedby={
            issue("privacyAcknowledged") ? "inquiry-privacy-error" : undefined
          }
          className="accent-primary mt-1 size-4 shrink-0"
        />
        <span>
          Am citit și accept{" "}
          <Link
            href="/politica-de-confidentialitate"
            className="text-primary underline"
          >
            politica de confidențialitate
          </Link>
          . Datele sunt folosite numai pentru această solicitare.
          {issue("privacyAcknowledged") && (
            <span id="inquiry-privacy-error" className="block text-red-300">
              Acceptul este obligatoriu.
            </span>
          )}
        </span>
      </label>

      {state.status === "error" && (
        <p
          className="border border-red-400/50 bg-red-950/30 p-3 text-sm text-red-100"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-12 items-center justify-center gap-2 px-5 font-bold disabled:opacity-60"
      >
        <Send className="size-4" aria-hidden="true" />
        {pending ? "Se înregistrează…" : "Trimite solicitarea"}
      </button>
    </form>
  );
}

function PublicField({
  label,
  error,
  errorId,
  children,
}: {
  label: string;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold tracking-wide uppercase">
      {label}
      {children}
      {error && (
        <span
          id={errorId}
          className="text-xs font-medium tracking-normal text-red-300 normal-case"
        >
          {error}
        </span>
      )}
    </label>
  );
}
