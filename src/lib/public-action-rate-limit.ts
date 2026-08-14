import "server-only";

import { headers } from "next/headers";

import { isDatabaseConfigured } from "@/db/client";
import {
  consumePublicRateLimit,
  PublicRateLimitError,
} from "@/data/mutations/public-rate-limits";
import {
  createRequestKeyHash,
  normalizeClientAddress,
} from "@/domain/security/request-fingerprint";
import { env } from "@/env";

type RateLimitRule = {
  scope: string;
  limit: number;
  windowMs: number;
  discriminator?: string;
  includeAddress?: boolean;
};

/**
 * Applies the same limits, but never lets an unreachable database block the
 * caller. Use it for read-only endpoints that must keep working during a
 * database outage; an exceeded limit is still enforced.
 */
export async function enforcePublicActionRateLimitsBestEffort(
  rules: readonly RateLimitRule[],
) {
  if (!isDatabaseConfigured() || !env.RATE_LIMIT_SECRET) return;

  try {
    await enforcePublicActionRateLimits(rules);
  } catch (error) {
    if (error instanceof PublicRateLimitError) throw error;
  }
}

export async function enforcePublicActionRateLimits(
  rules: readonly RateLimitRule[],
) {
  if (!isDatabaseConfigured()) return;
  if (!env.RATE_LIMIT_SECRET) throw new PublicRateLimitError();

  const requestHeaders = await headers();
  const address = normalizeClientAddress(
    requestHeaders.get("x-forwarded-for"),
    requestHeaders.get("x-real-ip"),
  );

  for (const rule of rules) {
    const discriminator = rule.discriminator
      ? rule.includeAddress === false
        ? rule.discriminator
        : `${address}\u0000${rule.discriminator}`
      : address;
    await consumePublicRateLimit({
      ...rule,
      keyHash: createRequestKeyHash(
        env.RATE_LIMIT_SECRET,
        rule.scope,
        discriminator,
      ),
    });
  }
}
