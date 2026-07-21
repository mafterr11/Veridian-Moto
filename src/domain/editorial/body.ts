export type EditorialBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: readonly string[] };

function stripUnsafeMarkup(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim();
}

export function parseEditorialBody(markdown: string): EditorialBlock[] {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const blocks: EditorialBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    const text = stripUnsafeMarkup(paragraph.join(" "));
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  }

  function flushList() {
    const items = list.map(stripUnsafeMarkup).filter(Boolean);
    if (items.length) blocks.push({ type: "list", items });
    list = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(##|###)\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const text = stripUnsafeMarkup(heading[2] ?? "");
      if (text) {
        blocks.push({
          type: "heading",
          level: heading[1] === "##" ? 2 : 3,
          text,
        });
      }
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      const text = stripUnsafeMarkup(line.slice(2));
      if (text) blocks.push({ type: "quote", text });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}
