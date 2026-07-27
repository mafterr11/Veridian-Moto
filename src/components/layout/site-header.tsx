import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { SiteMobileNav } from "@/components/layout/site-mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

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

        <SiteMobileNav />
      </div>
    </header>
  );
}
