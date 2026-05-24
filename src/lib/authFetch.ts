/**
 * Centralised authenticated HTTP client for all TradeX frontend fetch calls.
 *
 * Design decisions:
 * - Reads the JWT from localStorage under the `tradex_token` key and
 *   automatically injects it as an `Authorization: Bearer …` header.
 * - Throws an Error for any non-2xx response, exposing the server's `error`
 *   field when available, so callers can surface a meaningful message to the
 *   user without having to inspect `res.ok` themselves.
 * - Merges caller-supplied headers last so individual callers can still
 *   override Content-Type (e.g. multipart/form-data uploads).
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem("tradex_token");

  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    baseHeaders["Authorization"] = `Bearer ${token}`;
  }

  const mergedHeaders: Record<string, string> = {
    ...baseHeaders,
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, { ...options, headers: mergedHeaders });

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) errorMessage = body.error;
    } catch {
      // Body is not JSON — keep the default message
    }
    throw new Error(errorMessage);
  }

  return res;
}
