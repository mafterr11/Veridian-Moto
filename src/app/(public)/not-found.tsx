import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pagina nu a fost găsită",
  robots: { index: false, follow: false },
};

export default function PublicNotFound() {
  return (
    <main className="bg-porcelain text-obsidian grid min-h-[70svh] place-items-center px-5 py-20">
      <div className="max-w-3xl text-center">
        <p className="text-veridian-dark font-heading text-7xl font-extrabold sm:text-9xl">
          404
        </p>
        <h1 className="font-heading mt-4 text-4xl font-extrabold uppercase sm:text-6xl">
          Drumul acesta nu apare pe hartă.
        </h1>
        <p className="text-steel mx-auto mt-5 max-w-xl leading-7">
          Modelul, articolul sau configurația poate să nu existe ori să nu mai
          fie publică.
        </p>
        <Link
          href="/"
          className={buttonVariants({ size: "lg", className: "mt-8" })}
        >
          <ArrowLeft aria-hidden="true" /> Pagina principală
        </Link>
      </div>
    </main>
  );
}
