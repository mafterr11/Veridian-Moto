"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ro">
      <body className="bg-obsidian text-porcelain grid min-h-svh place-items-center px-5 py-20 font-sans">
        <main className="max-w-2xl text-center">
          <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
            VERIDIAN Moto
          </p>
          <h1 className="font-heading mt-4 text-5xl font-extrabold uppercase sm:text-7xl">
            Aplicația trebuie repornită.
          </h1>
          <p className="text-muted-foreground mt-5 leading-7">
            A apărut o eroare la nivelul structurii principale. Reîncearcă sau
            revino la pagina principală.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="bg-primary text-primary-foreground h-12 px-6 font-bold"
            >
              Reîncearcă
            </button>
            {/* A full reload remains available even when the App Router itself failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="border-border inline-flex h-12 items-center justify-center border px-6 font-bold"
            >
              Pagina principală
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
