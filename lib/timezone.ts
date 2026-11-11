// The clock the current user is looking at. Kept free of next/headers so both
// client components and the formatters can import it.
export const TIMEZONE_COOKIE = "cr_tz";

/**
 * A usable IANA zone for a cookie/header value, or null. Cookie values may
 * arrive percent-encoded (older clients used encodeURIComponent), so decode
 * defensively before asking Intl.
 */
export function normalizeTimezone(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;

  let candidate = value.trim();
  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    // Not encoded (or a stray "%"): use it as-is.
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate });
    return candidate;
  } catch {
    return null;
  }
}

/** The browser/phone zone, which is the user's own clock. */
export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Default render zone. On the server there is no browser to ask, so callers
 * that render on the server must pass the session zone explicitly; this only
 * covers client-side renders and keeps the old UTC behaviour as a fallback.
 */
export function displayTimezone(): string {
  return typeof window === "undefined" ? "UTC" : browserTimezone();
}
