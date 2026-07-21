import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

export const serverlessDatabaseOptions = {
  // Supabase's transaction pooler does not support named prepared statements.
  prepare: false,
  // Avoid an extra pg_type discovery round-trip when a serverless instance
  // opens its first pooled connection. VERIDIAN only uses PostgreSQL built-ins.
  fetch_types: false,
  ssl: "require",
  // Each Vercel function instance owns its module state. Keeping this at one
  // prevents every warm instance from reserving a five-connection sub-pool.
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10,
  max_lifetime: 60,
  keep_alive: 30,
  connection: {
    application_name: "veridian-moto-vercel",
    statement_timeout: 15_000,
    lock_timeout: 5_000,
    idle_in_transaction_session_timeout: 15_000,
  },
} as const;

export function createDatabaseConnection(databaseUrl: string) {
  const client = postgres(databaseUrl, serverlessDatabaseOptions);

  return {
    db: drizzle(client, { schema }),
    sql: client,
    close: () => client.end({ timeout: 5 }),
  };
}

export type Database = ReturnType<typeof createDatabaseConnection>["db"];
