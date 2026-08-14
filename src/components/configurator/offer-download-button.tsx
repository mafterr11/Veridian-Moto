"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { ConfigurationState } from "@/domain/configurator/types";
import { cn } from "@/lib/utils";

type OfferDownloadButtonProps = {
  modelSlug: string;
  configuration: ConfigurationState;
  className?: string;
};

function fileNameFrom(disposition: string | null, fallback: string) {
  const match = disposition?.match(/filename="([^"]+)"/);
  return match?.[1] ?? fallback;
}

/**
 * Downloads the offer for the configuration currently on screen.
 *
 * The request carries only the visitor's selections; the server recalculates
 * every price before rendering. This path never touches the configuration
 * snapshot table, so it keeps working when saving is unavailable.
 */
export function OfferDownloadButton({
  modelSlug,
  configuration,
  className,
}: OfferDownloadButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function download() {
    setPending(true);
    setError(undefined);

    try {
      const response = await fetch("/api/oferta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelSlug, state: configuration }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Oferta nu a putut fi generată.",
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileNameFrom(
        response.headers.get("Content-Disposition"),
        "VERIDIAN-oferta.pdf",
      );
      document.body.append(link);
      link.click();
      link.remove();
      // Give the browser a moment to start the download before releasing it.
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Oferta nu a putut fi generată.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-2">
      <button
        type="button"
        onClick={download}
        disabled={pending}
        className={cn(
          buttonVariants({
            variant: "outline",
            className: "h-11 min-w-0 px-2 text-xs lg:h-12 lg:px-4 lg:text-sm",
          }),
          className,
        )}
      >
        {pending ? (
          <Loader2
            className="animate-spin"
            data-icon="inline-start"
            aria-hidden="true"
          />
        ) : (
          <Download data-icon="inline-start" aria-hidden="true" />
        )}
        {pending ? "Se pregătește PDF-ul…" : "Descarcă oferta PDF"}
      </button>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
