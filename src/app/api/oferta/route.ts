import { NextResponse } from "next/server";

import {
  buildOfferFromState,
  OfferUnavailableError,
} from "@/data/queries/public-offers";
import { PublicRateLimitError } from "@/data/mutations/public-rate-limits";
import {
  MAX_OFFER_REQUEST_BYTES,
  offerRequestSchema,
} from "@/domain/offers/schemas";
import { renderOfferPdf } from "@/lib/pdf/render-offer";
import { enforcePublicActionRateLimitsBestEffort } from "@/lib/public-action-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function problem(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Renders the offer for a configuration that has not been saved.
 *
 * Deliberately independent of the configuration snapshot table: a visitor must
 * be able to take their configuration away even while the database is
 * unreachable. Nothing is persisted and the payload carries no personal data.
 */
export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > MAX_OFFER_REQUEST_BYTES) {
    return problem("Configurația trimisă este prea mare.", 413);
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(body);
  } catch {
    return problem("Configurația trimisă nu este validă.", 400);
  }

  const parsed = offerRequestSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return problem("Configurația trimisă este incompletă.", 400);
  }

  try {
    await enforcePublicActionRateLimitsBestEffort([
      { scope: "offer-pdf", limit: 30, windowMs: 10 * 60_000 },
    ]);

    const { offer, dealer, previewImage, fileName } = await buildOfferFromState(
      parsed.data,
    );
    const pdf = await renderOfferPdf({ offer, dealer, previewImage });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    if (error instanceof PublicRateLimitError)
      return problem(error.message, 429);
    if (error instanceof OfferUnavailableError) {
      return problem(error.message, 409);
    }

    console.error("offer-pdf: failed to render live configuration", error);
    return problem("Oferta nu a putut fi generată. Încearcă din nou.", 500);
  }
}
