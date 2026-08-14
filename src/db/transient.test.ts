import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { isTransientDatabaseError, withDatabaseRetry } from "@/db/transient";

function pgError(code: string, cause?: unknown) {
  return Object.assign(new Error(`failed with ${code}`), { code, cause });
}

describe("isTransientDatabaseError", () => {
  it("recognises the pooler cold-start timeout", () => {
    expect(isTransientDatabaseError(pgError("CONNECT_TIMEOUT"))).toBe(true);
  });

  it("looks through the query error at its connection cause", () => {
    // postgres.js reports the failed connection as the cause of the query.
    const queryError = Object.assign(new Error("write CONNECT_TIMEOUT"), {
      cause: pgError("CONNECT_TIMEOUT"),
    });

    expect(isTransientDatabaseError(queryError)).toBe(true);
  });

  it("does not treat a rejected statement as transient", () => {
    // 23505 is a unique violation: retrying changes nothing.
    expect(isTransientDatabaseError(pgError("23505"))).toBe(false);
    expect(isTransientDatabaseError(new Error("boom"))).toBe(false);
    expect(isTransientDatabaseError(undefined)).toBe(false);
  });
});

describe("withDatabaseRetry", () => {
  it("returns the result without retrying when the operation succeeds", async () => {
    const operation = vi.fn().mockResolvedValue("ok");

    await expect(withDatabaseRetry(operation)).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("retries once after a connection failure", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(pgError("CONNECT_TIMEOUT"))
      .mockResolvedValue("ok");

    await expect(withDatabaseRetry(operation, { delayMs: 0 })).resolves.toBe(
      "ok",
    );
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("gives up after the final attempt", async () => {
    const operation = vi.fn().mockRejectedValue(pgError("CONNECT_TIMEOUT"));

    await expect(
      withDatabaseRetry(operation, { delayMs: 0 }),
    ).rejects.toMatchObject({ code: "CONNECT_TIMEOUT" });
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("does not retry an error the database rejected on its merits", async () => {
    const operation = vi.fn().mockRejectedValue(pgError("23505"));

    await expect(
      withDatabaseRetry(operation, { delayMs: 0 }),
    ).rejects.toMatchObject({ code: "23505" });
    expect(operation).toHaveBeenCalledTimes(1);
  });
});
