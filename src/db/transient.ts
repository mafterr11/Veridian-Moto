import "server-only";

/**
 * Connection-level failures that say nothing about the statement itself.
 *
 * Supabase's pooler shuts a tenant's pool down while it is idle and starts it
 * again on the next connection, so the first request after a quiet period can
 * outlast `connect_timeout`. Public write actions are exactly the kind of rare
 * traffic that keeps paying that cost, which is why a single retry — after the
 * failed attempt has already woken the pool — resolves nearly all of them.
 */
const TRANSIENT_ERROR_CODES = new Set([
  // postgres.js client codes
  "CONNECT_TIMEOUT",
  "CONNECTION_CLOSED",
  "CONNECTION_DESTROYED",
  "CONNECTION_ENDED",
  "CONNECTION_REFUSED",
  // Node socket codes
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "ETIMEDOUT",
  "EAI_AGAIN",
  // PostgreSQL class 08 (connection exception) and operator intervention
  "08000",
  "08003",
  "08006",
  "57P01",
  "57P03",
]);

function errorCode(error: unknown) {
  if (typeof error !== "object" || !error) return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  return undefined;
}

export function isTransientDatabaseError(error: unknown): boolean {
  if (TRANSIENT_ERROR_CODES.has(errorCode(error) ?? "")) return true;

  // postgres.js reports a failed connection as the cause of the query error.
  const cause = (error as { cause?: unknown })?.cause;
  return cause ? TRANSIENT_ERROR_CODES.has(errorCode(cause) ?? "") : false;
}

/**
 * Runs an idempotent database operation, retrying once when the failure was a
 * connection problem rather than a rejected statement.
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  { attempts = 2, delayMs = 300 }: { attempts?: number; delayMs?: number } = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientDatabaseError(error) || attempt === attempts - 1) {
        throw error;
      }
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
