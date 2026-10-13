"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  additional_riders?: number;
  destination_phone?: string | null;
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
  trip_type?: "one_way" | "roundtrip";
  return_pickup_at?: string;
  /** Set when editing an outbound ride that already has a return leg. */
  return_ride_id?: number | null;
  /** Set when editing a ride that is itself a return leg (of this outbound). */
  outbound_ride_id?: number | null;
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
  const [tripType, setTripType] = useState<"one_way" | "roundtrip">(defaults?.trip_type ?? "one_way");
  const [splitMode, setSplitMode] = useState<"one" | "split">("one");
  const [createdPair, setCreatedPair] = useState<{ outbound: number; ret: number; returnAt: string } | null>(null);
  const [geoTimers, setGeoTimers] = useState<Record<string, NodeJS.Timeout>>({});

  // Edit context: a linked return leg locks the trip type, and a return leg
  // itself is steered from its outbound ride.
  const hasReturnRide = (defaults?.return_ride_id ?? null) !== null;
  const isReturnLeg = (defaults?.outbound_ride_id ?? null) !== null;

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
        additional_riders: Number(raw.additional_riders || 0),
        destination_phone: raw.destination_phone || null,
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

    // A return leg is steered from its outbound ride: no trip fields of its own.
    const editingReturnLeg = mode === "edit" && isReturnLeg;
    if (!editingReturnLeg) {
      payload.trip_type = tripType;
      if (tripType === "roundtrip") {
        payload.return_pickup_at = raw.return_pickup_at || null;
        // Splitting happens once, at booking time — afterwards the two rides
        // are edited (and their times kept in sync) individually.
        // (Repeats keep their own return each, so a series is never split.)
        if (mode === "create" && splitMode === "split" && !recurring) payload.split_return = true;
      }
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
      // A split roundtrip books two rides that each need a driver: stay on the
      // page with links to both assignment flows instead of picking one.
      if (!editing && body.return_ride) {
        setCreatedPair({
          outbound: body.id,
          ret: body.return_ride.id,
          returnAt: String(raw.return_pickup_at ?? "").replace("T", " "),
        });
        router.refresh();
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
      {createdPair && (
        <div role="status" className="rounded-xl border border-brand-200 bg-brand-50 p-4 md:col-span-2">
          <p className="text-sm font-semibold text-brand-800">
            Round trip booked: outbound ride #{createdPair.outbound} plus return ride #{createdPair.ret}
            {createdPair.returnAt ? ` (back at ${createdPair.returnAt})` : ""}.
          </p>
          <p className="mt-1 text-sm text-ink-500">Each leg needs its own driver — assign them both.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/rides/${createdPair.outbound}/assign`}>
              <Button variant="accent">Assign outbound #{createdPair.outbound}</Button>
            </Link>
            <Link href={`/rides/${createdPair.ret}/assign`}>
              <Button variant="ghost" className="border-brand-300 bg-card text-brand-800 hover:bg-brand-100">
                Assign return #{createdPair.ret}
              </Button>
            </Link>
          </div>
        </div>
      )}
      <Input name="passenger_name" label="Passenger name" error={err("passenger_name")}
        value={formValues.passenger_name ?? ""} onChange={(e) => handleChange("passenger_name", e.target.value)}
        autoComplete="off" required />
      <Input name="passenger_phone" type="tel" label="Passenger phone" error={err("passenger_phone")}
        value={formValues.passenger_phone ?? ""} onChange={(e) => handleChange("passenger_phone", e.target.value)}
        hint="E.g. +1 555 010 2030." required />
      <Input name="additional_riders" type="number" min={0} max={30} label="Additional riders" error={err("passenger_additional_riders")}
        value={formValues.additional_riders ?? 0} onChange={(e) => handleChange("additional_riders", e.target.value)}
        hint="Extra riders travelling with the passenger." />
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
      <Input name="destination_phone" type="tel" label="Destination phone (optional)" error={err("passenger_destination_phone")}
        value={formValues.destination_phone ?? ""} onChange={(e) => handleChange("destination_phone", e.target.value)}
        hint="Who to call on arrival, e.g. the clinic front desk." />
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

      {/* Trip type sits above recurrence: a roundtrip needs a return time, and at
          booking time the dispatcher chooses one ride or a split pair. Hidden
          for a return leg — its trip is steered from the outbound ride. */}
      {!(mode === "edit" && isReturnLeg) && (
        <div className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold">Trip type</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Trip type">
            <label className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${tripType === "one_way" ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line bg-card text-ink-500"}`}>
              <input type="radio" checked={tripType === "one_way"} disabled={mode === "edit" && hasReturnRide}
                onChange={() => setTripType("one_way")} className="h-4 w-4 accent-brand-600" /> One-way
            </label>
            <label className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${tripType === "roundtrip" ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line bg-card text-ink-500"}`}>
              <input type="radio" checked={tripType === "roundtrip"}
                onChange={() => setTripType("roundtrip")} className="h-4 w-4 accent-brand-600" /> Round trip
            </label>
          </div>
          {mode === "edit" && hasReturnRide && (
            <p className="mt-1 text-sm text-ink-500">
              Return trip #{defaults?.return_ride_id} already exists — this ride stays a roundtrip until the return is cancelled.
            </p>
          )}

          {tripType === "roundtrip" && (
            <div className="mt-4 grid gap-4">
              <Input name="return_pickup_at" type="datetime-local" label="Return pickup"
                error={err("return_pickup_at")}
                min={typeof formValues.scheduled_pickup_at === "string" ? formValues.scheduled_pickup_at : undefined}
                value={formValues.return_pickup_at ?? ""} onChange={(e) => handleChange("return_pickup_at", e.target.value)}
                hint="Agency local time. Must be after the outbound pickup." required />
              {mode === "create" && (
                <div>
                  <span className="mb-1 block text-sm font-semibold">Return handling</span>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Return handling">
                    <label className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${splitMode === "one" ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line bg-card text-ink-500"}`}>
                      <input type="radio" checked={splitMode === "one"}
                        onChange={() => setSplitMode("one")} className="h-4 w-4 accent-brand-600" /> Keep as one ride
                    </label>
                    <label className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${splitMode === "split" ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line bg-card text-ink-500"}`}>
                      <input type="radio" checked={splitMode === "split"} disabled={recurring}
                        onChange={() => setSplitMode("split")} className="h-4 w-4 accent-brand-600" /> Split: create return trip
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {recurring
                      ? "A repeating roundtrip cannot be split — each repeat keeps its own return time on the one ride."
                      : splitMode === "one"
                        ? "One ride covers both directions; the driver runs out and back under it."
                        : "Books a second ride with the route swapped, picked up at the return time. Each leg is assigned and executed separately."}
                  </p>
                  {err("split_return") && <p className="mt-1 text-sm font-medium text-bad-fg">{err("split_return")}</p>}
                </div>
              )}
              {mode === "edit" && hasReturnRide && (
                <p className="text-sm text-ink-500">
                  Changing the return time moves return trip #{defaults?.return_ride_id} with it.
                </p>
              )}
            </div>
          )}
          {err("trip_type") && <p className="mt-1 text-sm font-medium text-bad-fg">{err("trip_type")}</p>}
        </div>
      )}
      {mode === "edit" && isReturnLeg && (
        <p className="rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink-500 md:col-span-2">
          This is the return leg of ride #{defaults?.outbound_ride_id} — its route and return time
          are managed from the outbound ride. Changing the pickup time here moves the outbound return time with it.
        </p>
      )}

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