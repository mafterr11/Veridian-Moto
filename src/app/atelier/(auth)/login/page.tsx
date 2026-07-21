import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";

import { AdminDocumentLink } from "@/components/admin/admin-document-link";
import { LoginForm } from "@/components/admin/login-form";
import { BrandMark } from "@/components/layout/brand-mark";
import { isAdminInfrastructureConfigured } from "@/data/auth/admin-session";

export const metadata: Metadata = {
  title: "Autentificare",
  description: "Acces securizat pentru administratorul VERIDIAN Moto.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginPageContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const reason = Array.isArray(params.motiv) ? params.motiv[0] : params.motiv;
  const configured = isAdminInfrastructureConfigured();

  return (
    <main className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative isolate hidden overflow-hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="technical-grid absolute inset-0 -z-20 opacity-70" />
        <div className="bg-primary/15 absolute -bottom-48 -left-40 -z-10 size-[34rem] rounded-full blur-[120px]" />
        <BrandMark />

        <div className="max-w-2xl">
          <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
            Spațiu privat
          </p>
          <h1 className="font-heading mt-5 text-7xl leading-[0.84] font-extrabold tracking-[-0.035em] uppercase xl:text-8xl">
            Atelierul din spatele drumului.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-lg leading-7">
            Catalogul, stocul și configuratorul vor fi administrate aici, fără
            ca datele interne să intre în site-ul public.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SecurityNote
            icon={ShieldCheck}
            title="Acces unic"
            detail="Supabase Auth, email permis și profil activ"
          />
          <SecurityNote
            icon={Database}
            title="Date separate"
            detail="DTO-uri publice și operații server-only"
          />
        </div>
      </section>

      <section className="bg-porcelain text-obsidian flex min-h-svh items-center px-5 py-12 sm:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <BrandMark inverse />
          </div>
          <AdminDocumentLink
            href="/"
            className="text-steel hover:text-veridian-dark mt-10 inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase lg:mt-0"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Înapoi la site
          </AdminDocumentLink>

          <p className="text-veridian-dark mt-12 text-xs font-bold tracking-[0.18em] uppercase">
            VERIDIAN Atelier
          </p>
          <h2 className="font-heading mt-3 text-5xl leading-none font-extrabold uppercase sm:text-6xl">
            Autentificare
          </h2>
          <p className="text-steel mt-4 text-sm leading-6">
            Nu există înregistrare publică. Doar administratorul provisionat
            poate continua.
          </p>

          {(!configured || reason === "configurare") && (
            <div className="border-signal-amber/50 bg-signal-amber/10 mt-6 border p-4 text-sm leading-6">
              <p className="font-bold">Infrastructura nu este configurată.</p>
              <p className="text-steel mt-1">
                Adaugă variabilele din <code>.env.example</code>, rulează
                migrările, seed-ul și provisionarea administratorului.
              </p>
            </div>
          )}

          {configured && reason === "autentificare" && (
            <div className="border-obsidian/15 mt-6 border p-4 text-sm leading-6">
              Sesiunea lipsește, a expirat sau nu are acces la acest spațiu.
            </div>
          )}

          <LoginForm configured={configured} />

          <p className="text-steel mt-8 text-xs leading-5">
            Ruta nu este publicată în navigație sau motoare de căutare, însă
            protecția reală este autentificarea și autorizarea pe server.
          </p>
        </div>
      </section>
    </main>
  );
}

function SecurityNote({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof ShieldCheck;
  title: string;
  detail: string;
}) {
  return (
    <div className="border-border bg-background/50 border p-4 backdrop-blur">
      <Icon className="text-primary size-5" aria-hidden="true" />
      <p className="mt-4 text-sm font-bold">{title}</p>
      <p className="text-muted-foreground mt-1 text-xs leading-5">{detail}</p>
    </div>
  );
}

function LoginPageLoading() {
  return (
    <main className="bg-porcelain text-obsidian grid min-h-svh place-items-center">
      <p className="text-sm font-semibold">Se pregătește accesul…</p>
    </main>
  );
}
