import { parseEditorialBody } from "@/domain/editorial/body";

export function ArticleBody({ markdown }: { markdown: string }) {
  const blocks = parseEditorialBody(markdown);
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="space-y-7 text-base leading-8 sm:text-lg">
        {blocks.map((block, index) => {
          if (block.type === "heading") {
            const className =
              "font-heading pt-5 font-extrabold uppercase text-obsidian " +
              (block.level === 2 ? "text-4xl sm:text-5xl" : "text-3xl");
            return block.level === 2 ? (
              <h2 key={index} className={className}>
                {block.text}
              </h2>
            ) : (
              <h3 key={index} className={className}>
                {block.text}
              </h3>
            );
          }
          if (block.type === "quote") {
            return (
              <blockquote
                key={index}
                className="border-veridian text-obsidian font-heading border-l-4 py-2 pl-6 text-2xl leading-8 font-bold"
              >
                {block.text}
              </blockquote>
            );
          }
          if (block.type === "list") {
            return (
              <ul key={index} className="text-steel grid list-disc gap-2 pl-6">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          }
          return (
            <p key={index} className="text-steel">
              {block.text}
            </p>
          );
        })}
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
