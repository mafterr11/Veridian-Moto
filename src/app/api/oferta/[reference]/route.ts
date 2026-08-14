import { NextResponse } from "next/server";

import { buildOfferFromReference } from "@/data/queries/public-offers";
import { PublicRateLimitError } from "@/data/mutations/public-rate-limits";
import { publicReferenceSchema } from "@/domain/enquiries/schemas";
import { renderOfferPdf } from "@/lib/pdf/render-offer";
import { enforcePublicActionRateLimitsBestEffort } from "@/lib/public-action-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ reference: string }> };

function problem(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

/** Renders the offer for a saved configuration, using the stored snapshot. */
export async function GET(_request: Request, { params }: RouteContext) {
  const parsed = publicReferenceSchema.safeParse((await params).reference);
  if (!parsed.success) {
    return problem("Referință invalidă.", 404);
  }

  try {
    await enforcePublicActionRateLimitsBestEffort([
      { scope: "offer-pdf", limit: 30, windowMs: 10 * 60_000 },
    ]);

    const payload = await buildOfferFromReference(parsed.data);
    if (!payload) return problem("Configurația nu a fost găsită.", 404);

    const pdf = await renderOfferPdf({
      offer: payload.offer,
      dealer: payload.dealer,
      previewImage: payload.previewImage,
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${payload.fileName}"`,
        "Content-Length": String(pdf.byteLength),
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    if (error instanceof PublicRateLimitError)
      return problem(error.message, 429);

    console.error("offer-pdf: failed to render saved configuration", error);
    return problem("Oferta nu a putut fi generată. Încearcă din nou.", 500);
  }
}
