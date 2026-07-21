"use client";

import { usePathname } from "next/navigation";
import {
  Bike,
  BookOpenText,
  Boxes,
  Gauge,
  LayoutGrid,
  MessageSquareText,
  Package,
  Settings,
} from "lucide-react";

import { AdminDocumentLink } from "@/components/admin/admin-document-link";
import { cn } from "@/lib/utils";

const items = [
  { label: "Panou", href: "/atelier", icon: Gauge },
  { label: "Categorii", href: "/atelier/categorii", icon: LayoutGrid },
  { label: "Modele", href: "/atelier/modele", icon: Bike },
  { label: "Stoc", href: "/atelier/stoc", icon: Boxes },
  { label: "Accesorii", href: "/atelier/accesorii", icon: Package },
  { label: "Solicitări", href: "/atelier/solicitari", icon: MessageSquareText },
  { label: "Descoperă", href: "/atelier/descopera", icon: BookOpenText },
  { label: "Setări", href: "/atelier/setari", icon: Settings },
] as const;

export function AdminNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Administrare"
      className={
        compact ? "flex min-w-max gap-1 px-5 py-2 sm:px-8" : "grid gap-1 p-4"
      }
    >
      {items.map(({ label, href, icon: Icon }) => {
        const active =
          href === "/atelier"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <AdminDocumentLink
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 px-3 text-sm font-bold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : compact
                  ? "text-obsidian hover:bg-obsidian/5"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </AdminDocumentLink>
        );
      })}
    </nav>
  );
}
