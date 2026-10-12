// Typed Laravel API client. Server Components pass token+tenant explicitly
// (from httpOnly cookies); client components use apiFromBrowser() instead.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/v1";

export interface CursorPage<T> {
  data: T[];
  next_cursor: string | null;
  next_page_url: string | null;
  prev_cursor: string | null;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export async function apiFetch<T>(
  path: string,
  opts: { token: string; tenant: string; init?: RequestInit; revalidate?: number } ,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts.init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${opts.token}`,
      "X-Tenant": opts.tenant,
      ...(opts.init?.headers ?? {}),
    },
    // Explicit cache semantics (Next.js 16): dynamic ops data defaults to fresh.
    cache: opts.revalidate ? undefined : "no-store",
    next: opts.revalidate ? { revalidate: opts.revalidate } : undefined,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({ message: res.statusText }))) as ApiError;
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export class ApiErrorResponse extends Error {
  status: number;
  body: ApiError;
  constructor(status: number, body: ApiError) {
    super(body.message || `Request failed (${status})`);
    this.name = "ApiErrorResponse";
    this.status = status;
    this.body = body;
  }
}

export async function apiFromBrowser<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  // Same-origin BFF proxy (app/api/[...path]): attaches the httpOnly
  // token + tenant cookies server-side, so no CORS and no client secrets.
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "same-origin",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({ message: res.statusText }))) as ApiError;
    throw new ApiErrorResponse(res.status, body);
  }
  return (await res.json()) as T;
}

/* ---------------- Domain types (mirror backend JSON) ---------------- */

export interface Role { name: string }
export interface Tenant { name: string; slug: string }
export interface DriverProfile {
  id: number;
  onboarding_status: string;
  tenant?: Tenant | null;
  availability: { weekday: number; start_time: string; end_time: string }[];
  documents: { id: number; type: string; file_path: string; mime_type: string | null; verified_at: string | null; created_at: string }[];
}
export interface User {
  id: number; name: string; email: string; phone?: string | null;
  role: Role; is_active: boolean;
  tenant?: Tenant | null;
  driver_profile?: DriverProfile | null;
}
export interface RideStatus { code: string; label: string; is_terminal: boolean }
export interface Assignment {
  id: number; driver_profile_id: number; assigned_at: string;
  unassigned_at: string | null; self_assigned: boolean;
  driver?: { id: number; user?: User };
}
export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly";
  interval: number;
  count: number | null;
  until: string | null;
  label?: string | null;
}

/** One recurring series as listed by GET /ride-series. */
export interface RideSeriesSummary {
  series_key: string;
  label: string | null;
  recurrence: RecurrenceRule | null;
  occurrences: number;
  open_count: number;
  first_pickup_at: string | null;
  last_pickup_at: string | null;
  next_pickup_at: string | null;
  total_price_cents: number;
}

export interface RideSeriesDetail extends RideSeriesSummary {
  rides: Ride[];
}

/** A grouping bucket from GET /rides/board. */
export interface BoardGroup {
  key: string;
  label: string;
  count: number;
  meta: {
    series_key?: string | null;
    occurrence_of?: number | null;
    next_pickup_at?: string | null;
    phone?: string | null;
    series_count?: number;
  };
  rides: Ride[];
}

export type BoardGrouping = "day" | "series" | "passenger" | "driver" | "none";

export interface Board {
  by: BoardGrouping;
  window_days: number;
  past_days: number;
  include_completed: boolean;
  total: number;
  truncated: boolean;
  groups: BoardGroup[];
}

export interface Ride {
  id: number; status: RideStatus;
  passenger_info: { name: string; phone: string; passengers?: number; wheelchair?: boolean; child_seat?: boolean };
  pickup_address: string; pickup_lat: number; pickup_lng: number;
  dropoff_address: string; dropoff_lat: number; dropoff_lng: number;
  scheduled_pickup_at: string; actual_pickup_at: string | null; actual_dropoff_at: string | null;
  priority: number; notes: string | null; price_cents: number | null;
  // Present on every occurrence of a recurring series; null for a one-off ride.
  series_key?: string | null;
  series_label?: string | null;
  occurrence_index?: number | null;
  recurrence?: RecurrenceRule | null;
  /** Only on the create response: how many rides the series expanded into. */
  series_size?: number;
  active_assignment?: Assignment | null;
  assignments?: Assignment[];
  /** Driver home → pickup → drop-off → home, miles; null until a driver with a home base is assigned. */
  total_distance_miles?: number | null;
}
export interface RideEvent {
  id: number; from_status_id: number | null; to_status_id: number;
  toStatus?: RideStatus; actor?: User | null; metadata?: Record<string, unknown> | null;
  created_at: string;
}
