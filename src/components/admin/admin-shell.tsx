import { LogOut } from "lucide-react";

import { logoutAction } from "@/app/atelier/actions";
import { AdminDocumentLink } from "@/components/admin/admin-document-link";
import { AdminNav } from "@/components/admin/admin-nav";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import type { AdminIdentity } from "@/data/auth/admin-session";

export function AdminShell({
  identity,
  children,
}: {
  identity: AdminIdentity;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-porcelain text-obsidian min-h-svh lg:grid lg:grid-cols-[18rem_1fr]">
      <aside className="bg-obsidian text-porcelain border-border flex flex-col border-r lg:sticky lg:top-0 lg:h-svh">
        <div className="border-border flex h-20 items-center border-b px-5">
          <BrandMark />
        </div>

        <div className="hidden flex-1 lg:block">
          <AdminNav />
        </div>

        <div className="border-border flex items-center justify-between gap-3 border-t p-4 lg:block">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{identity.displayName}</p>
            <p className="text-muted-foreground truncate text-xs">
              {identity.email}
            </p>
          </div>
          <form action={logoutAction} className="lg:mt-4">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full"
            >
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">Ieși din cont</span>
            </Button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-obsidian/10 bg-porcelain/90 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-5 backdrop-blur sm:px-8 lg:h-20 lg:px-10">
          <div>
            <p className="text-veridian-dark text-[0.65rem] font-bold tracking-[0.16em] uppercase">
              VERIDIAN Atelier
            </p>
            <p className="font-heading text-xl font-bold uppercase">
              Administrare
            </p>
          </div>
          <AdminDocumentLink
            href="/"
            target="_blank"
            rel="noreferrer"
            className="border-obsidian/20 hover:border-veridian-dark h-9 border px-3 text-xs leading-9 font-bold transition-colors"
          >
            Vezi site-ul
          </AdminDocumentLink>
        </header>
        <div className="border-obsidian/10 overflow-x-auto border-b lg:hidden">
          <AdminNav compact />
        </div>
        {children}
      </div>
    </div>
  );
}
