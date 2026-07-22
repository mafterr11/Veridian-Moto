import { Check, Clock3, Quote } from "lucide-react";

import { parseEditorialBody } from "@/domain/editorial/body";
import { estimateReadingMinutes } from "@/domain/editorial/reading-time";

function headingId(text: string, index: number) {
  const slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${slug || "sectiune"}-${index}`;
}

export function ArticleBody({ markdown }: { markdown: string }) {
  const blocks = parseEditorialBody(markdown);
  const firstParagraphIndex = blocks.findIndex(
    (block) => block.type === "paragraph",
  );
  const sections = blocks.flatMap((block, index) =>
    block.type === "heading" && block.level === 2
      ? [{ id: headingId(block.text, index), title: block.text }]
      : [],
  );

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
      <div className="grid items-start gap-12 lg:grid-cols-[14rem_minmax(0,46rem)] lg:justify-center lg:gap-20">
        <aside className="border-obsidian/15 lg:sticky lg:top-28 lg:border-l lg:pl-6">
          <div className="text-steel flex items-center gap-2 text-xs font-bold tracking-[0.16em] uppercase">
            <Clock3 className="text-veridian-dark size-4" aria-hidden="true" />
            {estimateReadingMinutes(markdown)} min de citit
          </div>
          {sections.length > 0 ? (
            <nav className="mt-7" aria-label="Cuprinsul articolului">
              <p className="text-obsidian text-xs font-extrabold tracking-[0.18em] uppercase">
                În articol
              </p>
              <ol className="mt-4 grid gap-3">
                {sections.map((section, index) => (
                  <li key={section.id} className="flex gap-3">
                    <span className="text-veridian-dark shrink-0 text-xs font-bold tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={`#${section.id}`}
                      className="text-steel hover:text-obsidian text-sm leading-5 transition-colors"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </aside>

        <div className="space-y-7 text-base leading-8 sm:text-lg">
          {blocks.map((block, index) => {
            if (block.type === "heading") {
              const id = headingId(block.text, index);
              const className =
                "font-heading scroll-mt-28 pt-9 font-extrabold uppercase text-obsidian first:pt-0 " +
                (block.level === 2
                  ? "text-4xl leading-[0.95] sm:text-5xl"
                  : "text-2xl leading-tight sm:text-3xl");
              return block.level === 2 ? (
                <h2 key={id} id={id} className={className}>
                  {block.text}
                </h2>
              ) : (
                <h3 key={id} id={id} className={className}>
                  {block.text}
                </h3>
              );
            }
            if (block.type === "quote") {
              return (
                <blockquote
                  key={index}
                  className="bg-obsidian text-porcelain relative my-12 overflow-hidden px-7 py-9 sm:px-10 sm:py-11"
                >
                  <Quote
                    className="text-veridian mb-5 size-8"
                    strokeWidth={2.4}
                    aria-hidden="true"
                  />
                  <p className="font-heading relative text-2xl leading-tight font-extrabold uppercase sm:text-3xl">
                    {block.text}
                  </p>
                  <span
                    className="bg-veridian absolute right-0 bottom-0 h-1.5 w-24"
                    aria-hidden="true"
                  />
                </blockquote>
              );
            }
            if (block.type === "list") {
              return (
                <ul
                  key={index}
                  className="border-veridian-dark/20 bg-veridian/8 my-9 grid gap-4 border px-6 py-7 sm:px-8"
                >
                  {block.items.map((item) => (
                    <li
                      key={item}
                      className="text-obsidian flex items-start gap-3 leading-7"
                    >
                      <span className="bg-veridian mt-1.5 grid size-5 shrink-0 place-items-center rounded-full">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p
                key={index}
                className={
                  index === firstParagraphIndex
                    ? "text-obsidian border-veridian border-l-4 pl-6 text-xl leading-9 font-medium sm:text-2xl sm:leading-10"
                    : "text-steel"
                }
              >
                {block.text}
              </p>
            );
          })}

          <div className="border-obsidian/15 mt-16 flex items-center gap-4 border-t pt-7">
            <span className="bg-veridian h-1 w-12" aria-hidden="true" />
            <p className="text-steel text-xs font-bold tracking-[0.18em] uppercase">
              Jurnalul VERIDIAN Moto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function formatArticleDate(date: Date) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
