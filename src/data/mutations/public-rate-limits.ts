import "server-only";

import { lte, sql } from "drizzle-orm";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { publicActionRateLimits } from "@/db/schema";
import { withDatabaseRetry } from "@/db/transient";

export class PublicRateLimitError extends Error {
  constructor() {
    super("Prea multe încercări. Așteaptă câteva minute și încearcă din nou.");
    this.name = "PublicRateLimitError";
  }
}

export async function consumePublicRateLimit({
  scope,
  keyHash,
  limit,
  windowMs,
  now = new Date(),
}: {
  scope: string;
  keyHash: string;
  limit: number;
  windowMs: number;
  now?: Date;
}) {
  if (!isDatabaseConfigured()) return;

  const db = getDatabase();
  const cutoff = new Date(now.getTime() - windowMs);
  const staleCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1_000);

  const count = await withDatabaseRetry(() =>
    db.transaction(async (tx) => {
      await tx
        .delete(publicActionRateLimits)
        .where(lte(publicActionRateLimits.updatedAt, staleCutoff));

      const [row] = await tx
        .insert(publicActionRateLimits)
        .values({ scope, keyHash, windowStartedAt: now, requestCount: 1 })
        .onConflictDoUpdate({
          target: [
            publicActionRateLimits.scope,
            publicActionRateLimits.keyHash,
          ],
          set: {
            windowStartedAt: sql`case when ${publicActionRateLimits.windowStartedAt} <= ${cutoff} then ${now} else ${publicActionRateLimits.windowStartedAt} end`,
            requestCount: sql`case when ${publicActionRateLimits.windowStartedAt} <= ${cutoff} then 1 else ${publicActionRateLimits.requestCount} + 1 end`,
            updatedAt: now,
          },
        })
        .returning({ requestCount: publicActionRateLimits.requestCount });

      return row?.requestCount ?? limit + 1;
    }),
  );

  if (count > limit) throw new PublicRateLimitError();
}
