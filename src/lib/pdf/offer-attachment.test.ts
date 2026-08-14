// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  buildOfferFromReference: vi.fn(),
  renderOfferPdf: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/data/queries/public-offers", () => ({
  buildOfferFromReference: mocks.buildOfferFromReference,
}));
vi.mock("@/lib/pdf/render-offer", () => ({
  renderOfferPdf: mocks.renderOfferPdf,
}));

import { renderOfferAttachment } from "@/lib/pdf/offer-attachment";

describe("renderOfferAttachment", () => {
  beforeEach(() => {
    mocks.buildOfferFromReference.mockReset();
    mocks.renderOfferPdf.mockReset();
  });

  it("returns the document as base64 for the mail provider", async () => {
    mocks.buildOfferFromReference.mockResolvedValue({
      offer: {},
      dealer: {},
      fileName: "VERIDIAN-RIFT-700-K7M2QPX9RT4B.pdf",
    });
    mocks.renderOfferPdf.mockResolvedValue(Buffer.from("%PDF-1.7"));

    await expect(renderOfferAttachment("K7M2QPX9RT4B")).resolves.toEqual({
      filename: "VERIDIAN-RIFT-700-K7M2QPX9RT4B.pdf",
      content: Buffer.from("%PDF-1.7").toString("base64"),
    });
  });

  it("returns nothing when the configuration is gone", async () => {
    mocks.buildOfferFromReference.mockResolvedValue(undefined);

    await expect(
      renderOfferAttachment("K7M2QPX9RT4B"),
    ).resolves.toBeUndefined();
    expect(mocks.renderOfferPdf).not.toHaveBeenCalled();
  });

  it.each([
    ["the configuration cannot be read", "buildOfferFromReference"],
    ["the document cannot be rendered", "renderOfferPdf"],
  ] as const)("swallows a failure when %s", async (_, failing) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.buildOfferFromReference.mockResolvedValue({
      offer: {},
      dealer: {},
      fileName: "offer.pdf",
    });
    mocks[failing].mockRejectedValue(new Error("CONNECT_TIMEOUT"));

    // The enquiry is already committed at this point: losing the attachment
    // must never cost VERIDIAN the lead.
    await expect(
      renderOfferAttachment("K7M2QPX9RT4B"),
    ).resolves.toBeUndefined();
  });
});
