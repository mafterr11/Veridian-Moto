import Link from "next/link";
import { Menu, SlidersHorizontal } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="border-border/80 bg-background/92 sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12">
        <BrandMark />

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Principală"
        >
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring px-4 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link href="/configurator" className={buttonVariants({ size: "sm" })}>
            Configurează
            <SlidersHorizontal data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>

        <details className="group relative lg:hidden">
          <summary
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "list-none [&::-webkit-details-marker]:hidden",
            )}
            aria-label="Deschide meniul"
          >
            <Menu aria-hidden="true" />
          </summary>
          <div className="border-border bg-popover absolute top-[calc(100%+0.75rem)] right-0 w-[min(21rem,calc(100vw-2.5rem))] border p-3 shadow-2xl">
            <nav className="flex flex-col" aria-label="Meniu mobil">
              {siteConfig.navigation.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-border text-foreground hover:bg-muted flex items-center justify-between border-b px-3 py-4 font-semibold transition-colors"
                >
                  {item.label}
                  <span className="text-muted-foreground text-xs">
                    0{index + 1}
                  </span>
                </Link>
              ))}
              <Link
                href="/configurator"
                className={cn(buttonVariants(), "mt-3 w-full")}
              >
                Configurează
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
