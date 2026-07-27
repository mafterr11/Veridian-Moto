"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const DESKTOP_QUERY = "(min-width: 64rem)";

export function SiteMobileNav() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const [renderedPathname, setRenderedPathname] = useState(pathname);

  if (renderedPathname !== pathname) {
    setRenderedPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  return (
    <details
      ref={containerRef}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group relative lg:hidden"
    >
      <summary
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "list-none [&::-webkit-details-marker]:hidden",
        )}
        aria-label={open ? "Închide meniul" : "Deschide meniul"}
        aria-expanded={open}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </summary>
      <div
        className="border-border bg-popover absolute top-[calc(100%+0.75rem)] right-0 w-[min(21rem,calc(100vw-2.5rem))] border p-3 shadow-2xl"
        onClick={() => setOpen(false)}
      >
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
  );
}
