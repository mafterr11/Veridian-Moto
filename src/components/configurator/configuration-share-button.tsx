"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function ConfigurationShareButton() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      className="border-obsidian/20 hover:border-veridian-dark inline-flex h-12 items-center justify-center gap-2 border px-5 text-sm font-bold transition-colors"
      aria-live="polite"
    >
      {copied ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
      {copied ? "Link copiat" : "Copiază linkul"}
    </button>
  );
}
