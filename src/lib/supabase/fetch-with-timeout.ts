const SUPABASE_REQUEST_TIMEOUT_MS = 8_000;

/**
 * Supabase Auth is part of every protected Atelier request. Bound its network
 * time so an upstream stall cannot leave a streamed page on its loading shell
 * indefinitely.
 */
export function fetchSupabaseWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const timeoutSignal = AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;

  return fetch(input, { ...init, signal });
}
