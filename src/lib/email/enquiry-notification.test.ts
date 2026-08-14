// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/env", () => ({
  env: {
    RESEND_API_KEY: "re_test",
    RESEND_FROM_EMAIL: "oferte@veridian-moto.ro",
    ENQUIRY_NOTIFICATION_EMAIL: "vanzari@veridian-moto.ro",
    NEXT_PUBLIC_APP_URL: "https://veridian-moto.ro",
  },
}));

import {
  isEnquiryNotificationConfigured,
  sendEnquiryNotification,
} from "@/lib/email/enquiry-notification";

const enquiry = {
  id: "5c9f1b0e-0000-4000-8000-000000000000",
  type: "configuration" as const,
  name: "Ana Test",
  email: "ana.test@example.com",
  subject: "Ofertă RIFT 700",
  message: "Doresc o ofertă pentru această configurație.",
  preferredContactMethod: "email" as const,
  configurationReference: "K7M2QPX9RT4B",
};

const offer = {
  filename: "VERIDIAN-RIFT-700-K7M2QPX9RT4B.pdf",
  content: "JVBERi0xLjc=",
};

function sentBody() {
  const call = vi.mocked(fetch).mock.calls[0];
  return JSON.parse(String(call?.[1]?.body));
}

describe("sendEnquiryNotification", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("attaches the offer so VERIDIAN can forward it directly", async () => {
    await expect(
      sendEnquiryNotification({ ...enquiry, offer }),
    ).resolves.toEqual({ sent: true });

    expect(sentBody().attachments).toEqual([
      { filename: offer.filename, content: offer.content },
    ]);
  });

  it("always includes the offer link, which outlives the attachment", async () => {
    await sendEnquiryNotification({ ...enquiry, offer });
    const body = sentBody();

    expect(body.text).toContain(
      "Ofertă PDF: https://veridian-moto.ro/api/oferta/K7M2QPX9RT4B",
    );
    expect(body.html).toContain(
      'href="https://veridian-moto.ro/api/oferta/K7M2QPX9RT4B"',
    );
  });

  it("flags a configuration enquiry whose document could not be rendered", async () => {
    await sendEnquiryNotification({ ...enquiry, offer: undefined });
    const body = sentBody();

    expect(body.attachments).toBeUndefined();
    expect(body.text).toContain("oferta PDF nu a putut fi atașată");
    // The link is the fallback route to the document.
    expect(body.text).toContain(
      "https://veridian-moto.ro/api/oferta/K7M2QPX9RT4B",
    );
  });

  it("leaves a general enquiry untouched", async () => {
    await sendEnquiryNotification({
      ...enquiry,
      type: "contact",
      configurationReference: undefined,
    });
    const body = sentBody();

    expect(body.attachments).toBeUndefined();
    expect(body.text).not.toContain("Ofertă PDF");
    expect(body.html).not.toContain("/api/oferta/");
  });

  it("reports that delivery is possible, so callers know to render the offer", () => {
    expect(isEnquiryNotificationConfigured()).toBe(true);
  });

  it("skips delivery entirely when the provider is not configured", async () => {
    vi.resetModules();
    vi.doMock("@/env", () => ({ env: { RESEND_API_KEY: undefined } }));
    const unconfigured = await import("@/lib/email/enquiry-notification");

    expect(unconfigured.isEnquiryNotificationConfigured()).toBe(false);
    await expect(
      unconfigured.sendEnquiryNotification({ ...enquiry, offer }),
    ).resolves.toEqual({ sent: false, reason: "not-configured" });
    expect(fetch).not.toHaveBeenCalled();

    vi.doUnmock("@/env");
    vi.resetModules();
  });

  it("reports a provider rejection instead of throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 422 })),
    );

    await expect(
      sendEnquiryNotification({ ...enquiry, offer }),
    ).resolves.toEqual({ sent: false, reason: "provider-error" });
  });
});
