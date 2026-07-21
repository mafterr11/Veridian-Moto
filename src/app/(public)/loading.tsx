export default function PublicLoading() {
  return (
    <main
      className="bg-porcelain min-h-[70svh] animate-pulse px-5 py-16 sm:px-8 sm:py-24"
      aria-label="Se încarcă pagina"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="bg-obsidian/10 h-6 w-40" />
        <div className="bg-obsidian/10 mt-6 h-28 max-w-4xl" />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-obsidian/5 h-72" />
          <div className="bg-obsidian/5 h-72" />
          <div className="bg-obsidian/5 h-72" />
        </div>
      </div>
    </main>
  );
}
