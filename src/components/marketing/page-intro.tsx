export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="border-border relative isolate overflow-hidden border-b py-18 sm:py-24 lg:py-28">
      <div
        className="technical-grid pointer-events-none absolute inset-0 -z-20 opacity-60"
        aria-hidden="true"
      />
      <div
        className="bg-primary/10 pointer-events-none absolute -top-60 right-0 -z-10 size-[34rem] rounded-full blur-[120px]"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
          {eyebrow}
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-end">
          <h1 className="font-heading max-w-5xl text-6xl leading-[0.82] font-extrabold tracking-[-0.035em] uppercase sm:text-8xl lg:text-9xl">
            {title}
          </h1>
          <p className="text-muted-foreground max-w-xl text-base leading-7 lg:pb-2 lg:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
