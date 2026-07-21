/**
 * `unstable_cache` persists values as JSON. Dates therefore have to cross the
 * cache boundary as ISO strings and be restored before they reach a page.
 */
export function serializeCacheDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("Cannot serialize an invalid cache date.");
  }

  return date.toISOString();
}

export function restoreCacheDate(value: Date | string): Date {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("Cannot restore an invalid cache date.");
  }

  return date;
}
