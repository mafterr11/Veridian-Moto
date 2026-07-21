import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

export function createDatabaseConnection(databaseUrl: string) {
  const client = postgres(databaseUrl, {
    // Supabase's transaction pooler does not support named prepared statements.
    prepare: false,
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return {
    db: drizzle(client, { schema }),
    close: () => client.end(),
  };
}

export type Database = ReturnType<typeof createDatabaseConnection>["db"];
