export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  surface = "dark",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  surface?: "dark" | "light";
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"
      }
    >
      <p
        className={`mb-4 text-xs font-bold tracking-[0.2em] uppercase sm:text-sm ${surface === "light" ? "text-veridian-dark" : "text-primary"}`}
      >
        {eyebrow}
      </p>
      <h2 className="font-heading text-4xl leading-[0.95] font-extrabold tracking-[-0.025em] uppercase sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description ? (
        <p
          className={`${surface === "light" ? "text-steel" : "text-muted-foreground"} mt-5 max-w-2xl text-base leading-7 sm:text-lg`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
