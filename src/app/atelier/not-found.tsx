import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Înregistrare inexistentă",
  robots: { index: false, follow: false },
};

export default function AtelierNotFound() {
  return (
    <main className="bg-porcelain text-obsidian grid min-h-[70svh] place-items-center px-5 py-20">
      <div className="max-w-xl text-center">
        <p className="text-veridian-dark text-xs font-bold tracking-[0.2em] uppercase">
          Atelier · 404
        </p>
        <h1 className="font-heading mt-4 text-5xl font-extrabold uppercase">
          Înregistrarea nu mai există.
        </h1>
        <p className="text-steel mt-4 leading-7">
          Este posibil să fi fost arhivată sau ca identificatorul să fie
          incorect. Nicio modificare nu a fost aplicată.
        </p>
        <Link
          href="/atelier"
          className={buttonVariants({ size: "lg", className: "mt-8" })}
        >
          Înapoi la panou
        </Link>
      </div>
    </main>
  );
}
