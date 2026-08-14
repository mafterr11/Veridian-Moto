// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const offerMocks = vi.hoisted(() => ({
  buildOfferFromState: vi.fn(),
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
vi.mock("@/data/queries/public-offers", async () => {
  const actual = await vi.importActual<
    typeof import("@/data/queries/public-offers")
  >("@/data/queries/public-offers");
  return { ...actual, buildOfferFromState: offerMocks.buildOfferFromState };
});

import { POST } from "@/app/api/oferta/route";
import { OfferUnavailableError } from "@/data/queries/public-offers";
import { PublicRateLimitError } from "@/data/mutations/public-rate-limits";

const validBody = {
  modelSlug: "rift-700",
  state: {
    modelId: "rift-700",
    previewAngle: "front-three-quarter",
    selectedByGroup: { finish: ["color-graphite"] },
  },
};

function post(body: string) {
  return POST(
    new Request("https://veridian-moto.ro/api/oferta", {
      method: "POST",
      body,
    }),
  );
}

describe("POST /api/oferta", () => {
  beforeEach(() => {
    offerMocks.buildOfferFromState.mockReset();
    offerMocks.renderOfferPdf.mockReset();
    offerMocks.enforcePublicActionRateLimitsBestEffort.mockReset();
    offerMocks.buildOfferFromState.mockResolvedValue({
      offer: { modelName: "Rift 700" },
      dealer: {},
      previewImage: undefined,
      fileName: "VERIDIAN-RIFT-700.pdf",
    });
    offerMocks.renderOfferPdf.mockResolvedValue(
      Buffer.from("%PDF-1.7 test payload"),
    );
  });

  it("returns the rendered document as a download", async () => {
    const response = await post(JSON.stringify(validBody));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="VERIDIAN-RIFT-700.pdf"',
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("rejects a payload larger than the configuration limit", async () => {
    const response = await post("x".repeat(50_001));

    expect(response.status).toBe(413);
    expect(offerMocks.buildOfferFromState).not.toHaveBeenCalled();
  });

  it("rejects a body that is not JSON", async () => {
    expect((await post("not json")).status).toBe(400);
  });

  it("rejects a payload missing the model slug", async () => {
    const response = await post(JSON.stringify({ state: validBody.state }));

    expect(response.status).toBe(400);
    expect(offerMocks.buildOfferFromState).not.toHaveBeenCalled();
  });

  it("reports a configuration the catalogue no longer accepts", async () => {
    offerMocks.buildOfferFromState.mockRejectedValue(
      new OfferUnavailableError("Configurația nu mai este validă."),
    );

    const response = await post(JSON.stringify(validBody));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Configurația nu mai este validă.",
    });
  });

  it("passes an exceeded rate limit through as 429", async () => {
    offerMocks.enforcePublicActionRateLimitsBestEffort.mockRejectedValue(
      new PublicRateLimitError(),
    );

    expect((await post(JSON.stringify(validBody))).status).toBe(429);
  });

  it("does not leak internal failures to the visitor", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    offerMocks.buildOfferFromState.mockRejectedValue(
      new Error("ENOENT: fonts missing from /var/task"),
    );

    const response = await post(JSON.stringify(validBody));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Oferta nu a putut fi generată. Încearcă din nou.",
    });
  });
});
