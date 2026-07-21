import type { Metadata } from "next";
import { DatabaseZap, RotateCw } from "lucide-react";

import { AdminDocumentLink } from "@/components/admin/admin-document-link";
import { BrandMark } from "@/components/layout/brand-mark";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Atelier indisponibil",
};

export default function AtelierUnavailablePage() {
  return (
    <main className="bg-porcelain text-obsidian grid min-h-svh place-items-center px-5 py-12">
      <section className="border-obsidian/15 w-full max-w-2xl border bg-white p-7 sm:p-10">
        <BrandMark />
        <DatabaseZap
          className="text-veridian-dark mt-12 size-10"
          aria-hidden="true"
        />
        <p className="text-veridian-dark mt-6 text-xs font-bold tracking-[0.18em] uppercase">
          Conexiune temporar indisponibilă
        </p>
        <h1 className="font-heading mt-3 text-5xl leading-none font-extrabold uppercase sm:text-6xl">
          Atelierul nu poate citi baza de date.
        </h1>
        <p className="text-steel mt-5 max-w-xl text-sm leading-6">
          Nicio modificare nu a fost efectuată. Verifică starea proiectului
          Supabase și conexiunea pooler, apoi încearcă din nou.
        </p>
        <AdminDocumentLink
          href="/atelier"
          className={buttonVariants({ className: "mt-8" })}
        >
          <RotateCw aria-hidden="true" /> Reîncearcă
        </AdminDocumentLink>
      </section>
    </main>
  );
}
