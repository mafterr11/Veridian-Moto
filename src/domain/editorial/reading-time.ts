import { parseEditorialBody } from "@/domain/editorial/body";

const WORDS_PER_MINUTE = 210;

export function estimateReadingMinutes(markdown: string) {
  const words = parseEditorialBody(markdown)
    .flatMap((block) => (block.type === "list" ? block.items : [block.text]))
    .join(" ")
    .trim()
    .split(/\s+/u)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
