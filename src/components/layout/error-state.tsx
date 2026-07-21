"use client";

import Link from "next/link";
import type { Route } from "next";
import { RefreshCcw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

export function ErrorState({
  title,
  description,
  reset,
  homeHref = "/",
}: {
  title: string;
  description: string;
  reset: () => void;
  homeHref?: Route;
}) {
  return (
    <main className="bg-porcelain text-obsidian grid min-h-[70svh] place-items-center px-5 py-20">
      <div className="max-w-2xl text-center">
        <p className="text-veridian-dark text-xs font-bold tracking-[0.2em] uppercase">
          Oprire controlată
        </p>
        <h1 className="font-heading mt-4 text-5xl leading-none font-extrabold uppercase sm:text-7xl">
          {title}
        </h1>
        <p className="text-steel mx-auto mt-5 max-w-xl leading-7">
          {description}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" size="lg" onClick={reset}>
            <RefreshCcw aria-hidden="true" /> Încearcă din nou
          </Button>
          <Link
            href={homeHref}
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            Înapoi într-o zonă sigură
          </Link>
        </div>
      </div>
    </main>
  );
}
