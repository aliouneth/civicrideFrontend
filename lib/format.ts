// Tenant-timezone-aware formatting. Timezone comes from tenant settings
// (fetched once in layouts); defaults to UTC before settings load.
export function formatDateTime(iso: string, timeZone = "UTC"): string {
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

export function navigationUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Value for <input type="datetime-local">, i.e. local wall-clock `YYYY-MM-DDTHH:mm`
 * with no timezone suffix. `timeZone` should be the tenant's, so the browser
 * renders the same instant the scheduler sees on the board.
 */
export function toDatetimeLocal(iso: string, timeZone = "UTC"): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date(iso));

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
