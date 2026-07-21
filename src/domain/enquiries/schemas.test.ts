import { describe, expect, it } from "vitest";

import {
  inquirySchema,
  publicReferenceSchema,
} from "@/domain/enquiries/schemas";

const validInquiry = {
  configurationReference: "ABCDEFGHJKLM",
  name: "Ana Popescu",
  email: "ANA@EXAMPLE.COM",
  phone: "",
  subject: "Ofertă Terran 900 Rally",
  message: "Aș dori detalii despre această configurație și disponibilitate.",
  preferredContactMethod: "email" as const,
  privacyAcknowledged: true,
  website: "",
  startedAt: 1_721_476_800_000,
};

describe("public inquiry validation", () => {
  it("normalizes public references and email addresses", () => {
    const result = inquirySchema.parse({
      ...validInquiry,
      configurationReference: "  abcdefghjklm ",
    });

    expect(result.configurationReference).toBe("ABCDEFGHJKLM");
    expect(result.email).toBe("ana@example.com");
    expect(result.phone).toBeUndefined();
  });

  it("requires a phone number when phone is the preferred contact method", () => {
    const result = inquirySchema.safeParse({
      ...validInquiry,
      preferredContactMethod: "phone",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: ["phone"] })]),
      );
    }
  });

  it("rejects a filled honeypot field", () => {
    expect(
      inquirySchema.safeParse({ ...validInquiry, website: "spam.example" })
        .success,
    ).toBe(false);
  });

  it("rejects ambiguous or malformed public references", () => {
    expect(publicReferenceSchema.safeParse("ABCD-EFGH-IJKL").success).toBe(
      false,
    );
    expect(publicReferenceSchema.safeParse("ABCDEFGHIJK0").success).toBe(false);
  });

  it("rejects header-like line breaks and invalid phone characters", () => {
    expect(
      inquirySchema.safeParse({
        ...validInquiry,
        subject: "Subiect valid\r\nBcc: attacker@example.com",
      }).success,
    ).toBe(false);
    expect(
      inquirySchema.safeParse({ ...validInquiry, phone: "+40 <script>" })
        .success,
    ).toBe(false);
  });
});
