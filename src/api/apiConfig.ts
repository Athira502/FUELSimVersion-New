
export const API_BASE_URL="http://127.0.0.1:8000";

// Default timeout in milliseconds for all requests.
const DEFAULT_TIMEOUT_MS = 90_000;

// ─────────────────────────────────────────────────────────────────────────────
// Generic fetch wrapper
// ─────────────────────────────────────────────────────────────────────────────

export interface FetchOptions extends RequestInit {
  /** Override per-request timeout (ms). */
  timeoutMs?: number;
}

/**
 * Typed fetch helper. Throws an `ApiError` on non-2xx responses.
 *
 * @example
 * const data = await apiFetch<MyType>("/optimize/requests");
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(fetchOptions.headers ?? {}),
      },
      signal: controller.signal,
      ...fetchOptions,
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const body = await response.json();
        detail = body?.detail ?? body?.message ?? detail;
      } catch {
        // ignore parse errors — use statusText
      }
      throw new ApiError(response.status, detail, url);
    }

    // 204 No Content — return undefined cast to T
    if (response.status === 204) return undefined as unknown as T;

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new ApiError(408, `Request timed out after ${timeoutMs}ms`, url);
    }
    throw new ApiError(0, (err as Error).message ?? "Network error", url);
  } finally {
    clearTimeout(timerId);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom error class
// ─────────────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
    public readonly url?: string
  ) {
    super(`[${status}] ${detail}${url ? ` — ${url}` : ""}`);
    this.name = "ApiError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Query-string builder helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a plain object into a URLSearchParams string (leading `?`).
 * Skips keys whose value is `undefined`, `null`, or an empty array.
 * Arrays are serialised as repeated params: ?role_names=A&role_names=B
 *
 * @example
 * buildQuery({ system_name: "S4H", role_names: ["R1", "R2"] })
 * // → "?system_name=S4H&role_names=R1&role_names=R2"
 */
export function buildQuery(
  params: Record<string, string | number | boolean | string[] | number[] | null | undefined>
): string {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      if (val.length === 0) continue;
      val.forEach((v) => qs.append(key, String(v)));
    } else {
      qs.set(key, String(val));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}