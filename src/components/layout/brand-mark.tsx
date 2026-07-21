import Link from "next/link";

import { siteConfig } from "@/lib/site";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3"
      aria-label={`${siteConfig.name} — pagina principală`}
    >
      <span
        className={
          inverse
            ? "border-primary bg-primary text-primary-foreground font-heading grid size-9 place-items-center border text-2xl font-bold"
            : "border-primary/70 bg-primary/10 font-heading text-primary group-hover:bg-primary group-hover:text-primary-foreground grid size-9 place-items-center border text-2xl font-bold transition-colors"
        }
        aria-hidden="true"
      >
        V
      </span>
      <span className="font-heading text-xl leading-none font-bold tracking-[0.08em] sm:text-2xl">
        VERIDIAN <span className="text-primary text-xs sm:text-sm">MOTO</span>
      </span>
    </Link>
  );
}
