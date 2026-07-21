const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REFERENCE_LENGTH = 12;

export function createPublicReference(bytes: Uint8Array) {
  if (bytes.length < REFERENCE_LENGTH) {
    throw new Error(
      `Public references require ${REFERENCE_LENGTH} random bytes.`,
    );
  }

  return Array.from(bytes.subarray(0, REFERENCE_LENGTH), (value) =>
    REFERENCE_ALPHABET.at(value % REFERENCE_ALPHABET.length),
  ).join("");
}
