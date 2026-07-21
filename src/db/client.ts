import "server-only";

import { createDatabaseConnection } from "@/db/connection";
import { env } from "@/env";

let connection: ReturnType<typeof createDatabaseConnection> | undefined;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not configured.");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseConfigured() {
  return Boolean(env.DATABASE_URL);
}

export function getDatabase() {
  if (!env.DATABASE_URL) {
    throw new DatabaseNotConfiguredError();
  }

  connection ??= createDatabaseConnection(env.DATABASE_URL);
  return connection.db;
}
