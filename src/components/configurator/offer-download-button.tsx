"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import {
  offerDownloadClassName,
  offerDownloadIconClassName,
} from "@/components/configurator/offer-download-style";
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
          offerDownloadClassName,
          "h-10 text-[0.65rem] lg:h-11 lg:text-xs",
          className,
        )}
      >
        <span className={offerDownloadIconClassName}>
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="size-3.5" aria-hidden="true" />
          )}
        </span>
        <span className="truncate">
          {pending ? "Se pregătește PDF-ul…" : "Descarcă oferta PDF"}
        </span>
      </button>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
