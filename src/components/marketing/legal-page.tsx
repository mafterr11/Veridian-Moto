import Link from "next/link";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-porcelain text-obsidian">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <Link href="/" className="text-veridian-dark text-sm font-bold">
          ← Înapoi la pagina principală
        </Link>
        <h1 className="font-heading mt-10 text-5xl font-extrabold [overflow-wrap:anywhere] uppercase sm:text-7xl">
          {title}
        </h1>
        <p className="text-steel mt-4 text-sm">Ultima actualizare: {updated}</p>
        <div className="legal-copy mt-12 space-y-8 text-base leading-8">
          {children}
        </div>
      </div>
    </main>
  );
}
