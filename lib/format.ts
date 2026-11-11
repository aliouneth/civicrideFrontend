import { displayTimezone } from "./timezone";

// User-timezone-aware formatting. Ride timestamps are UTC instants; they are
// shown on the current user's clock. Server Components must pass the zone from
// the session so a render on the server (UTC) never leaks into the page.
export function formatDateTime(iso: string, timeZone = displayTimezone()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone, month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(iso));
}

export function formatMoney(cents: number | null, currency = "USD"): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
  }).format(cents / 100);
}

export function navigationUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/** Clock time only, on the given zone (e.g. "9:30 AM"). */
export function formatTime(iso: string, timeZone = displayTimezone()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone, hour: "numeric", minute: "2-digit",
  }).format(new Date(iso));
}

/**
 * Value for <input type="datetime-local">, i.e. local wall-clock `YYYY-MM-DDTHH:mm`
 * with no timezone suffix. `timeZone` should be the current user's zone, so the
 * browser and the backend agree on the instant the scheduler picked.
 */
export function toDatetimeLocal(iso: string, timeZone = displayTimezone()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date(iso));

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** "YYYY-MM-DD" for the current user's calendar date. */
export function currentDateKey(timeZone = displayTimezone()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** "YYYY-MM" for the current user's calendar month. */
export function currentMonthKey(timeZone = displayTimezone()): string {
  return currentDateKey(timeZone).slice(0, 7);
}
