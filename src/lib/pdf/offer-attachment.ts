import "server-only";

import { buildOfferFromReference } from "@/data/queries/public-offers";
import { renderOfferPdf } from "@/lib/pdf/render-offer";

export type OfferAttachment = {
  filename: string;
  /** Base64 payload, the shape Resend's REST API expects. */
  content: string;
};

/**
 * Renders a saved configuration into an attachable offer document.
 *
 * Returns `undefined` on any failure. The enquiry itself is already committed
 * by the time this runs and the database inbox is authoritative, so a missing
 * attachment must never cost VERIDIAN the lead.
 */
export async function renderOfferAttachment(
  reference: string,
): Promise<OfferAttachment | undefined> {
  try {
    const payload = await buildOfferFromReference(reference);
    if (!payload) return undefined;

    const pdf = await renderOfferPdf({
      offer: payload.offer,
      dealer: payload.dealer,
      previewImage: payload.previewImage,
    });

    return {
      filename: payload.fileName,
      content: pdf.toString("base64"),
    };
  } catch (error) {
    console.error("offer-pdf: failed to attach offer to notification", error);
    return undefined;
  }
}
