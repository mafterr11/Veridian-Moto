import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <p className="text-veridian-dark text-xs font-bold tracking-[0.16em] uppercase">
          {eyebrow}
        </p>
        <h1 className="font-heading mt-2 text-5xl leading-none font-extrabold tracking-tight uppercase sm:text-6xl">
          {title}
        </h1>
        <p className="text-steel mt-4 max-w-2xl text-sm leading-6">
          {description}
        </p>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}

export function AdminSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-obsidian/15 border bg-white", className)}>
      <div className="border-obsidian/10 border-b px-5 py-4 sm:px-6">
        <h2 className="font-heading text-2xl font-bold uppercase">{title}</h2>
        {description && (
          <p className="text-steel mt-1 text-xs leading-5">{description}</p>
        )}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
