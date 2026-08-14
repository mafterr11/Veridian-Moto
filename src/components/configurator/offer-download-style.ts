/**
 * Shared presentation for the offer download, used by both the configurator
 * button and the saved-configuration link so the action looks the same
 * wherever a visitor meets it.
 *
 * Deliberately squared off rather than reusing `buttonVariants`: the
 * configurator's own surfaces — option cards, panels, the total bar — all have
 * hard corners, and a rounded secondary button read as unfinished next to them.
 */
export const offerDownloadClassName =
  "group/pdf inline-flex min-w-0 items-center justify-center gap-2.5 border border-obsidian/25 bg-white px-3 font-bold tracking-[0.1em] text-obsidian uppercase transition-colors hover:border-obsidian hover:bg-obsidian hover:text-porcelain focus-visible:ring-3 focus-visible:ring-veridian/35 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:px-4";

/** The icon chip. Carries the brand accent and inverts with the button. */
export const offerDownloadIconClassName =
  "grid size-6 shrink-0 place-items-center bg-veridian/15 text-veridian-dark transition-colors group-hover/pdf:bg-veridian group-hover/pdf:text-obsidian";
