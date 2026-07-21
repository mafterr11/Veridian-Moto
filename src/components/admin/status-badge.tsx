import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  draft: "Draft",
  published: "Publicat",
  archived: "Arhivat",
  incoming: "În tranzit",
  available: "Disponibil",
  reserved: "Rezervat",
  sold: "Vândut",
  in_stock: "În stoc",
  low_stock: "Stoc redus",
  preorder: "Precomandă",
  unavailable: "Indisponibil",
  new: "Nouă",
  contacted: "Contactată",
  closed: "Închisă",
  spam: "Spam",
  scheduled: "Programat",
  featured: "Principal",
};

export function AdminStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center border px-2 text-[0.65rem] font-bold tracking-[0.08em] uppercase",
        status === "published" ||
          status === "available" ||
          status === "in_stock" ||
          status === "contacted"
          ? "border-veridian-dark/35 bg-veridian/10 text-veridian-dark"
          : status === "archived" ||
              status === "sold" ||
              status === "unavailable" ||
              status === "closed" ||
              status === "spam"
            ? "border-obsidian/15 bg-obsidian/5 text-steel"
            : "border-signal-amber/40 bg-signal-amber/10 text-obsidian",
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

export function AdminEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-obsidian/15 text-steel border border-dashed px-5 py-10 text-center text-sm">
      {children}
    </div>
  );
}
