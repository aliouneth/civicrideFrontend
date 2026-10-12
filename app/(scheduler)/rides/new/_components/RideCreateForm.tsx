"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/** Wisconsin fire-number pattern: E#### or W#### followed by road name */
const WI_FIRE_NUMBER_PATTERN = /^([EW])(\d{3,5})\s+(.+)/i;

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address.trim()) return null;

  // Try Wisconsin fire-number parsing first (E4104 N. Rail Rd, W1919 Vandenberg Street)
  // Nominatim cannot handle Wisconsin's coordinate-based addressing system
  const fireMatch = address.trim().match(WI_FIRE_NUMBER_PATTERN);
  if (fireMatch) {
    const [, ew, coordStr, road] = fireMatch;
    const coord = parseInt(coordStr, 10);
    // Approximate conversion: 1000 units ≈ 1 mile at Wisconsin's latitude
    // Base: ~42.5°N, -90.7°W
    const unitsPerDegree = 69.0;
    const lngDelta = (ew === 'E' ? 1 : -1) * (coord / 1000) / unitsPerDegree;
    // rough lat adjustment for N/S road prefix (handles "N." or "N " prefix)
    const normalizedRoad = road.toUpperCase();
    const lat = 42.5 + (normalizedRoad.startsWith('N.') || normalizedRoad.startsWith('N ') ? 0.02 : normalizedRoad.startsWith('S.') || normalizedRoad.startsWith('S ') ? -0.02 : 0);
    const baseLng = -90.7;
    const lng = baseLng + lngDelta;
    return { lat, lng };
  }

  try {
    const params = new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
      addressdetails: "0",
    });
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { "Accept": "application/json", "User-Agent": "CivicRide/1.0" },
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
    }
  } catch {}
  return null;
}

export interface RideDefaults {
  passenger_name?: string;
  passenger_phone?: string;
  passengers?: number;
  scheduled_pickup_at?: string;
  pickup_address?: string;
  pickup_lat?: string | number;
  pickup_lng?: string | number;
  dropoff_address?: string;
  dropoff_lat?: string | number;
  dropoff_lng?: string | number;
  notes?: string | null;
  wheelchair?: boolean;
  child_seat?: boolean;
}

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export function RideCreateForm({
  defaults,
  mode = "create",
  rideId,
}: {
  defaults?: RideDefaults;
  mode?: "create" | "edit";
  rideId?: number;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [bound, setBound] = useState<"count" | "until">("count");
  const [geoTimers, setGeoTimers] = useState<Record<string, NodeJS.Timeout>>({});

  // Form state to preserve user input on validation errors
  const [formValues, setFormValues] = useState<RideDefaults & {
    frequency?: string; interval?: string; series_label?: string;
    count?: string; until?: string;
    bound?: string;
    wheelchair?: boolean; child_seat?: boolean;
  }>(defaults ?? {});

  const handleChange = (name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const triggerGeocode = useCallback((field: "pickup" | "dropoff", address: string) => {
    const timer = geoTimers[field];
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(async () => {
      const coords = await geocode(address);
      if (coords) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[`${field}_lat`];
          delete next[`${field}_lng`];
          return next;
        });
        // We need to update the form fields - easiest is to dispatch a custom event
        window.dispatchEvent(new CustomEvent("geocode-result", {
          detail: { field, lat: coords.lat, lng: coords.lng }
        }));
      }
    }, 500);
    setGeoTimers((prev) => ({ ...prev, [field]: newTimer }));
  }, [geoTimers]);

  async function submit(form: FormData) {
    setSaving(true);
    setFieldErrors({});
    setFormError(null);

    const raw = Object.fromEntries(form.entries());
    const payload: Record<string, unknown> = {
      passenger_info: {
        name: raw.passenger_name, phone: raw.passenger_phone,
        passengers: Number(raw.passengers || 1),
        wheelchair: raw.wheelchair === "on", child_seat: raw.child_seat === "on",
      },
      pickup_address: raw.pickup_address, pickup_lat: Number(raw.pickup_lat), pickup_lng: Number(raw.pickup_lng),
      dropoff_address: raw.dropoff_address, dropoff_lat: Number(raw.dropoff_lat), dropoff_lng: Number(raw.dropoff_lng),
      scheduled_pickup_at: raw.scheduled_pickup_at, notes: raw.notes || null,
    };

    // Only send the bound the dispatcher actually chose, so the API never sees
    // both a count and an end date for one series.
    if (recurring) {
      payload.recurrence = {
        frequency: raw.frequency,
        interval: Number(raw.interval || 1),
        // Optional: names the group on the board and the groups page.
        ...(raw.series_label ? { label: raw.series_label } : {}),
        ...(bound === "count"
          ? { count: Number(raw.count || 2) }
          : { until: raw.until }),
      };
    }

    try {
      const editing = mode === "edit" && rideId !== undefined;
      const res = await fetch(editing ? `/api/rides/${rideId}` : "/api/rides", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        if (body.errors) {
          // Flatten nested keys (passenger_info.name → passenger_name) for inline display.
          const flat: Record<string, string[]> = {};
          for (const [k, v] of Object.entries<string[]>(body.errors)) {
            flat[k.replace("passenger_info.", "passenger_")] = v;
          }
          setFieldErrors(flat);
          document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
        } else setFormError(body.message ?? (editing ? "Could not save the ride." : "Could not create the ride."));
        return;
      }
      router.push(`/rides/${body.id}/assign`);
      router.refresh();
    } catch {
      setFormError("Network error — check your connection and retry.");
    } finally {
      setSaving(false);
    }
  }

  const err = (n: string) => fieldErrors[n]?.[0];
  const recurErr = (n: string) => fieldErrors[`recurrence.${n}`]?.[0];

  // Listen for geocode results and populate lat/lng fields
  useEffect(() => {
    function onGeo(e: CustomEvent) {
      const { field, lat, lng } = e.detail;
      const latInput = document.querySelector<HTMLInputElement>(`input[name="${field}_lat"]`);
      const lngInput = document.querySelector<HTMLInputElement>(`input[name="${field}_lng"]`);
      if (latInput) { latInput.value = String(lat); latInput.dispatchEvent(new Event("change", { bubbles: true })); }
      if (lngInput) { lngInput.value = String(lng); lngInput.dispatchEvent(new Event("change", { bubbles: true })); }
    }
    window.addEventListener("geocode-result", onGeo as EventListener);
    return () => window.removeEventListener("geocode-result", onGeo as EventListener);
  }, []);

  return (
    <form action={submit} className="grid gap-4 md:grid-cols-2" noValidate>
      <Input name="passenger_name" label="Passenger name" error={err("passenger_name")}
        value={formValues.passenger_name ?? ""} onChange={(e) => handleChange("passenger_name", e.target.value)}
        autoComplete="off" required />
      <Input name="passenger_phone" type="tel" label="Passenger phone" error={err("passenger_phone")}
        value={formValues.passenger_phone ?? ""} onChange={(e) => handleChange("passenger_phone", e.target.value)}
        hint="E.g. +1 555 010 2030." required />
      <Input name="passengers" type="number" min={1} max={30} label="Passengers" error={err("passengers")}
        value={formValues.passengers ?? 1} onChange={(e) => handleChange("passengers", e.target.value)} />
      <Input name="scheduled_pickup_at" type="datetime-local" label="Scheduled pickup" error={err("scheduled_pickup_at")}
        value={formValues.scheduled_pickup_at ?? ""} onChange={(e) => handleChange("scheduled_pickup_at", e.target.value)}
        hint="Agency local time." required />
      <Input name="pickup_address" label="Pickup address" error={err("pickup_address")}
        value={formValues.pickup_address ?? ""} onChange={(e) => handleChange("pickup_address", e.target.value)}
        className="md:col-span-2" required
        onBlur={(e) => triggerGeocode("pickup", e.currentTarget.value)} />
      <Input name="pickup_lat" type="number" step="any" label="Pickup latitude" error={err("pickup_lat")}
        value={formValues.pickup_lat ?? ""} onChange={(e) => handleChange("pickup_lat", e.target.value)}
        className="hidden" required />
      <Input name="pickup_lng" type="number" step="any" label="Pickup longitude" error={err("pickup_lng")}
        value={formValues.pickup_lng ?? ""} onChange={(e) => handleChange("pickup_lng", e.target.value)}
        className="hidden" required />
      <Input name="dropoff_address" label="Drop-off address" error={err("dropoff_address")}
        value={formValues.dropoff_address ?? ""} onChange={(e) => handleChange("dropoff_address", e.target.value)}
        className="md:col-span-2" required
        onBlur={(e) => triggerGeocode("dropoff", e.currentTarget.value)} />
      <Input name="dropoff_lat" type="number" step="any" label="Drop-off latitude" error={err("dropoff_lat")}
        value={formValues.dropoff_lat ?? ""} onChange={(e) => handleChange("dropoff_lat", e.target.value)}
        className="hidden" required />
      <Input name="dropoff_lng" type="number" step="any" label="Drop-off longitude" error={err("dropoff_lng")}
        value={formValues.dropoff_lng ?? ""} onChange={(e) => handleChange("dropoff_lng", e.target.value)}
        className="hidden" required />
      <Textarea name="notes" label="Notes for the driver (optional)" error={err("notes")}
        value={formValues.notes ?? ""} onChange={(e) => handleChange("notes", e.target.value)}
        className="md:col-span-2" />
      <label className="flex min-h-[44px] items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="wheelchair"
          checked={formValues.wheelchair ?? false}
          onChange={(e) => handleChange("wheelchair", e.target.checked)}
          className="h-5 w-5 accent-brand-600" /> Wheelchair access needed
      </label>
      <label className="flex min-h-[44px] items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="child_seat"
          checked={formValues.child_seat ?? false}
          onChange={(e) => handleChange("child_seat", e.target.checked)}
          className="h-5 w-5 accent-brand-600" /> Child seat needed
      </label>

      {/* Recurrence sits behind a toggle (design system §6, progressive
          disclosure) so the common one-off booking is not buried. Hidden when
          editing: a series is fixed when it is created — clone the ride to
          start a recurring one instead. */}
      {mode === "create" && (
      <div className="md:col-span-2">
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-line bg-paper px-3 text-sm font-semibold">
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)}
            className="h-5 w-5 accent-brand-600" />
          Repeat this ride
        </label>

        {recurring && (
          <fieldset className="mt-4 grid gap-4 rounded-lg border border-line bg-paper p-4 md:grid-cols-2">
            <legend className="px-1 text-sm font-semibold text-ink-500">Recurrence</legend>

            <Input name="series_label" label="Group name (optional)" className="md:col-span-2"
              error={recurErr("label")} placeholder="e.g. Mon/Wed school run"
              hint="Groups these rides together on the board. Leave blank to keep them unnamed."
              value={formValues.series_label ?? ""} onChange={(e) => handleChange("series_label", e.target.value)} />

            <Select name="frequency" label="Repeats" error={recurErr("frequency")}
              value={formValues.frequency ?? "weekly"} onChange={(e) => handleChange("frequency", e.target.value)}
              options={FREQUENCIES} />
            <Input name="interval" type="number" min={1} max={12}
              value={formValues.interval ?? 1} onChange={(e) => handleChange("interval", e.target.value)}
              label="Every" error={recurErr("interval")} hint="1 = every week, 2 = every other week." />

            <div className="md:col-span-2">
              <span className="mb-1 block text-sm font-semibold">Ends after</span>
              <div className="flex flex-wrap gap-2">
                <label className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${bound === "count" ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line bg-card text-ink-500"}`}>
                  <input type="radio" name="bound" checked={bound === "count"} onChange={() => { setBound("count"); handleChange("bound", "count"); }}
                    className="h-4 w-4 accent-brand-600" /> a number of rides
                </label>
                <label className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${bound === "until" ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line bg-card text-ink-500"}`}>
                  <input type="radio" name="bound" checked={bound === "until"} onChange={() => { setBound("until"); handleChange("bound", "until"); }}
                    className="h-4 w-4 accent-brand-600" /> a date
                </label>
              </div>
            </div>

            {bound === "count" ? (
              <Input name="count" type="number" min={2} max={30}
                value={formValues.count ?? 4} onChange={(e) => handleChange("count", e.target.value)}
                label="Number of rides" error={recurErr("count")} hint="The first ride plus its repeats. Maximum 30." />
            ) : (
              <Input name="until" type="date" label="Repeat until" error={recurErr("until")}
                value={formValues.until ?? ""} onChange={(e) => handleChange("until", e.target.value)}
                hint="The last pickup date falls on or before this day." />
            )}

            <p className="text-sm text-ink-500 md:col-span-2">
              Every repeat is created as its own ride, so each one is assigned and executed separately.
            </p>
          </fieldset>
        )}
      </div>
      )}

      {formError && <p role="alert" className="text-sm font-medium text-bad-fg md:col-span-2">{formError}</p>}
      <div className="md:col-span-2">
        <Button type="submit" loading={saving} variant="accent" className="w-full md:w-auto">
          {mode === "edit" ? "Save changes" : "Create ride"}
        </Button>
      </div>
    </form>
  );
}