import { describe, expect, it } from "vitest";

import { serverlessDatabaseOptions } from "@/db/connection";

describe("serverless database options", () => {
  it("bounds each function instance to one short-lived pooled connection", () => {
    expect(serverlessDatabaseOptions).toMatchObject({
      prepare: false,
      fetch_types: false,
      ssl: "require",
      max: 1,
      idle_timeout: 10,
      connect_timeout: 10,
      max_lifetime: 60,
      connection: {
        statement_timeout: 15_000,
        lock_timeout: 5_000,
        idle_in_transaction_session_timeout: 15_000,
      },
    });
  });
});
