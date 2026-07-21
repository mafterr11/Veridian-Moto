import { createHmac } from "node:crypto";
import { isIP } from "node:net";

export function normalizeClientAddress(
  forwardedFor: string | null,
  realIp: string | null,
) {
  const candidates = [forwardedFor?.split(",")[0], realIp];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && value.length <= 64 && isIP(value)) return value;
  }
  return "unknown";
}

export function createRequestKeyHash(
  secret: string,
  scope: string,
  discriminator: string,
) {
  return createHmac("sha256", secret)
    .update(`${scope}\u0000${discriminator}`)
    .digest("hex");
}
