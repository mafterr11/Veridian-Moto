import { describe, expect, it } from "vitest";

import { sanitizeSocialLinks } from "@/data/site-settings";

describe("sanitizeSocialLinks", () => {
  it("retains supported HTTP links and removes unsafe or unknown values", () => {
    expect(
      sanitizeSocialLinks({
        instagram: "https://instagram.com/veridian",
        youtube: "javascript:alert(1)",
        facebook: "data:text/html,unsafe",
        mastodon: "https://example.social/veridian",
      }),
    ).toEqual({ instagram: "https://instagram.com/veridian" });
  });

  it("fails closed for malformed persisted data", () => {
    expect(sanitizeSocialLinks(null)).toEqual({});
    expect(sanitizeSocialLinks(["https://example.com"])).toEqual({});
    expect(sanitizeSocialLinks({ instagram: 42 })).toEqual({});
  });
});
