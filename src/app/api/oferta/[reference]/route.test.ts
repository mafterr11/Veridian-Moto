// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const offerMocks = vi.hoisted(() => ({
  buildOfferFromReference: vi.fn(),
  renderOfferPdf: vi.fn(),
  enforcePublicActionRateLimitsBestEffort: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/pdf/render-offer", () => ({
  renderOfferPdf: offerMocks.renderOfferPdf,
}));
vi.mock("@/lib/public-action-rate-limit", () => ({
  enforcePublicActionRateLimitsBestEffort:
    offerMocks.enforcePublicActionRateLimitsBestEffort,
}));
vi.mock("@/data/queries/public-offers", () => ({
  buildOfferFromReference: offerMocks.buildOfferFromReference,
}));

import { GET } from "@/app/api/oferta/[reference]/route";

const VALID_REFERENCE = "K7M2QPX9RT4B";

function get(reference: string) {
  return GET(new Request(`https://veridian-moto.ro/api/oferta/${reference}`), {
    params: Promise.resolve({ reference }),
  });
}

describe("GET /api/oferta/[reference]", () => {
  beforeEach(() => {
    offerMocks.buildOfferFromReference.mockReset();
    offerMocks.renderOfferPdf.mockReset();
    offerMocks.enforcePublicActionRateLimitsBestEffort.mockReset();
    offerMocks.buildOfferFromReference.mockResolvedValue({
      offer: { modelName: "Rift 700" },
      dealer: {},
      previewImage: undefined,
      fileName: `VERIDIAN-RIFT-700-${VALID_REFERENCE}.pdf`,
    });
    offerMocks.renderOfferPdf.mockResolvedValue(
      Buffer.from("%PDF-1.7 test payload"),
    );
  });

  it("serves the saved configuration as a download", async () => {
    const response = await get(VALID_REFERENCE);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe(
      `attachment; filename="VERIDIAN-RIFT-700-${VALID_REFERENCE}.pdf"`,
    );
  });

  it.each([
    ["a reference of the wrong length", "K7M2QPX9"],
    ["a reference using excluded characters", "K7M2QPX9RT4I"],
    ["a path traversal attempt", "../../etc/passwd"],
  ])("returns 404 for %s", async (_, reference) => {
    const response = await get(reference);

    expect(response.status).toBe(404);
    expect(offerMocks.buildOfferFromReference).not.toHaveBeenCalled();
  });

  it("returns 404 when the configuration does not exist", async () => {
    offerMocks.buildOfferFromReference.mockResolvedValue(undefined);

    expect((await get(VALID_REFERENCE)).status).toBe(404);
  });

  it("does not leak internal failures to the visitor", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    offerMocks.buildOfferFromReference.mockRejectedValue(
      new Error("CONNECT_TIMEOUT pooler.supabase.com:6543"),
    );

    const response = await get(VALID_REFERENCE);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Oferta nu a putut fi generată. Încearcă din nou.",
    });
  });
});
