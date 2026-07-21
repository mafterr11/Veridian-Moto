import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("health route", () => {
  it("returns a non-cacheable liveness response", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      service: "veridian-moto",
    });
  });
});
