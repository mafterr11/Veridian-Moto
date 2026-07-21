import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowUpRight,
  Bike,
  BookOpenText,
  Boxes,
  MessageSquareText,
  Package,
  Radio,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getAdminDashboardCounts } from "@/data/queries/admin-catalogue";

export const metadata: Metadata = {
  title: "Panou principal",
};

export default function AdminDashboardPage() {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-veridian-dark text-xs font-bold tracking-[0.16em] uppercase">
            Faza 8
          </p>
          <h1 className="font-heading mt-2 text-5xl leading-none font-extrabold tracking-tight uppercase sm:text-6xl">
            Catalogul și poveștile au același atelier.
          </h1>
          <p className="text-steel mt-4 max-w-2xl text-sm leading-6">
            Modelele, solicitările, articolele și informațiile publice pot fi
            actualizate fără intervenții în cod.
          </p>
        </div>
        <span className="border-veridian-dark/30 text-veridian-dark inline-flex h-9 items-center gap-2 self-start border px-3 text-xs font-bold sm:self-auto">
          <span
            className="bg-veridian size-2 rounded-full"
            aria-hidden="true"
          />
          Acces autorizat
        </span>
      </div>

      <Suspense fallback={<DashboardMetricsLoading />}>
        <DashboardMetrics />
      </Suspense>

      <section className="border-obsidian/15 mt-8 grid overflow-hidden border lg:grid-cols-[1fr_auto]">
        <div className="bg-obsidian text-porcelain p-6 sm:p-8">
          <p className="text-primary text-xs font-bold tracking-[0.16em] uppercase">
            Flux recomandat
          </p>
          <h2 className="font-heading mt-3 text-4xl font-extrabold uppercase">
            Draft → validare → publicare
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
            Pentru catalog, completează produsul și configurația înainte de
            publicare. Pentru articole, verifică previzualizarea și data; datele
            globale se actualizează separat din Setări.
          </p>
        </div>
        <div className="bg-veridian text-obsidian flex min-w-56 items-end justify-between gap-6 p-6 sm:p-8">
          <span className="font-heading text-3xl font-extrabold uppercase">
            Atelier
          </span>
          <ArrowUpRight className="size-6" aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}

async function DashboardMetrics() {
  const counts = await getAdminDashboardCounts();
  const metrics = [
    {
      icon: Bike,
      label: "Modele",
      value: counts.models,
      href: "/atelier/modele",
    },
    {
      icon: Radio,
      label: "Modele publicate",
      value: counts.publishedModels,
      href: "/atelier/modele",
    },
    {
      icon: Boxes,
      label: "Unități publice",
      value: counts.publicInventory,
      href: "/atelier/stoc",
    },
    {
      icon: Package,
      label: "Accesorii",
      value: counts.accessories,
      href: "/atelier/accesorii",
    },
    {
      icon: MessageSquareText,
      label: "Solicitări noi",
      value: counts.newInquiries,
      href: "/atelier/solicitari",
    },
    {
      icon: BookOpenText,
      label: "Articole publicate",
      value: counts.publishedArticles,
      href: "/atelier/descopera",
    },
  ] as const;

  return (
    <section
      className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      aria-label="Rezumat catalog"
    >
      {metrics.map(({ icon: Icon, label, value, href }) => (
        <article key={label} className="border-obsidian/15 border bg-white p-5">
          <Icon className="text-veridian-dark size-5" aria-hidden="true" />
          <p className="font-heading mt-6 text-5xl font-extrabold">{value}</p>
          <p className="text-steel mt-1 text-xs font-bold tracking-[0.1em] uppercase">
            {label}
          </p>
          <Link
            href={href}
            prefetch={false}
            className={buttonVariants({ variant: "link", className: "mt-4" })}
          >
            Administrează <ArrowUpRight aria-hidden="true" />
          </Link>
        </article>
      ))}
    </section>
  );
}

function DashboardMetricsLoading() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="bg-obsidian/5 h-44 animate-pulse" />
      ))}
    </div>
  );
}
