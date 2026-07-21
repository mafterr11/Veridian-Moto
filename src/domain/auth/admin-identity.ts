export type AdminClaims = {
  id: string;
  email: string;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAllowedAdminEmail(
  candidate: string | undefined,
  allowed: string | undefined,
) {
  return Boolean(
    candidate &&
    allowed &&
    normalizeEmail(candidate) === normalizeEmail(allowed),
  );
}

export function readAdminClaims(
  claims: Record<string, unknown> | undefined,
): AdminClaims | null {
  if (!claims) {
    return null;
  }

  const id = claims.sub;
  const email = claims.email;

  if (typeof id !== "string" || typeof email !== "string") {
    return null;
  }

  return { id, email: normalizeEmail(email) };
}
