import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

export function createDatabaseConnection(databaseUrl: string) {
  const client = postgres(databaseUrl, {
  prepare: false,
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10,
  max_lifetime: 60,
});

  return {
    db: drizzle(client, { schema }),
    close: () => client.end(),
  };
}

export type Database = ReturnType<typeof createDatabaseConnection>["db"];
