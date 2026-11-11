"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { currentMonthKey, formatDateTime, formatMoney } from "@/lib/format";

interface AttestationRow {
  id: number;
  attested_at: string | null;
  driver: string | null;
  driver_profile_id: number;
  ride_duration_minutes?: number | null;
  ride: {
    id: number;
    status?: { code: string; label?: string };
    passenger_info?: { name?: string };
    pickup_address: string;
    dropoff_address: string;
    scheduled_pickup_at: string;
    mileage_claimed?: number | null;
    price_cents?: number | null;
    ride_duration_minutes?: number | null;
  } | null;
}

interface DriverOption { id: number; name: string; }

export function AttestedRidesClient({ timeZone }: { timeZone: string }) {
  const [rows, setRows] = useState<AttestationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(() => currentMonthKey(timeZone));
  const [driverId, setDriverId] = useState("");
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [mileageRateCents, setMileageRateCents] = useState<number | null>(null);
  const [agencyName, setAgencyName] = useState<string>("");

  useEffect(() => {
    document.title = "Attested rides";
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tenant");
        if (res.ok) {
          const body = await res.json();
          setMileageRateCents(body?.mileage_rate_cents ?? null);
          setAgencyName(body?.name ?? "");
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/drivers?page=100");
        if (res.ok) {
          const body = await res.json();
          const options: DriverOption[] = (body?.data ?? []).map((d: { id: number; user?: { name?: string } }) => ({
            id: d.id,
            name: d.user?.name ?? `Driver #${d.id}`,
          }));
          setDrivers(options);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ month });
        if (driverId) params.set("driver_profile_id", driverId);
        const res = await fetch(`/api/drivers/attestations?${params}`);
        if (!res.ok) throw new Error("Could not load attested rides.");
        const body = await res.json();
        setRows(body.data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load.");
      } finally {
        setLoading(false);
      }
    })();
  }, [month, driverId]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="hidden print:flex items-center gap-3 mb-4">
        <Logo height={32} />
        <span className="text-lg font-bold text-brand-800">{agencyName}</span>
      </div>
      <h1 className="text-2xl font-bold">Attested rides</h1>
      <p className="mt-1 text-sm text-ink-500">Rides drivers have attested.</p>
      <p className="hidden print:block mt-2 text-sm text-ink-600">
        Month: {month} {driverId ? `· ${drivers.find((d) => String(d.id) === driverId)?.name ?? "Selected driver"}` : "· All drivers"}
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-4 print:hidden">
        <label className="flex flex-col gap-1 text-sm font-medium text-ink-700">
          Driver
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            <option value="">All drivers</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink-700">
          Month
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </label>
      </div>

      {error && <p role="alert" className="mt-2 text-sm font-medium text-bad-fg">{error}</p>}
      {!loading && rows.length > 0 && (
        <>
          <div className="mt-4 flex items-center justify-between print:hidden">
          <p className="text-sm font-semibold text-ink-700">
            Total mileage claimed: {rows.reduce((sum, r) => sum + (r.ride?.mileage_claimed ?? 0), 0).toFixed(1)} mi
            {mileageRateCents != null && (
              <> · Total cost of miles: {formatMoney(Math.round(rows.reduce((sum, r) => sum + (r.ride?.mileage_claimed ?? 0), 0) * mileageRateCents))}</>
            )}
          </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-line bg-card px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              Print
            </button>
          </div>
          <div className="hidden print:block mt-2 text-sm text-ink-600">
            Total mileage claimed: {rows.reduce((sum, r) => sum + (r.ride?.mileage_claimed ?? 0), 0).toFixed(1)} mi
          {mileageRateCents != null && (
            <> · Total cost of miles: {formatMoney(Math.round(rows.reduce((sum, r) => sum + (r.ride?.mileage_claimed ?? 0), 0) * mileageRateCents))}</>
          )}
          </div>
        </>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-ink-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 rounded-xl border border-line bg-card px-4 py-6 text-center text-sm text-ink-500">
          No attested rides.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th className="px-3 py-2">Attested</th>
                {!driverId && <th className="px-3 py-2">Driver</th>}
                <th className="px-3 py-2">Passenger</th>
                <th className="px-3 py-2">Route</th>
                <th className="px-3 py-2 text-right">Mileage claimed</th>
                <th className="px-3 py-2 text-right">Ride duration</th>
                <th className="px-3 py-2 text-right">Total cost of miles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="tnum whitespace-nowrap px-3 py-2.5">{r.attested_at ? formatDateTime(r.attested_at, timeZone) : "—"}</td>
                  {!driverId && <td className="px-3 py-2.5">{r.driver ?? "—"}</td>}
                  <td className="px-3 py-2.5">{r.ride?.passenger_info?.name ?? "—"}</td>
                  <td className="max-w-[10rem] px-3 py-2.5 text-ink-600">
                    <span className="block truncate">{r.ride?.pickup_address}</span>
                    <span className="block truncate">→ {r.ride?.dropoff_address}</span>
                  </td>
                  <td className="tnum px-3 py-2.5 text-right">{r.ride?.mileage_claimed != null ? `${r.ride.mileage_claimed} mi` : "—"}</td>
                  <td className="tnum px-3 py-2.5 text-right">{r.ride_duration_minutes != null || r.ride?.ride_duration_minutes != null ? `${(Math.ceil(((r.ride_duration_minutes ?? r.ride?.ride_duration_minutes ?? 0) / 60) * 4) / 4).toFixed(2)} h` : "—"}</td>
                  <td className="tnum px-3 py-2.5 text-right">
                    {r.ride?.mileage_claimed != null && mileageRateCents != null
                      ? formatMoney(Math.round(r.ride.mileage_claimed * mileageRateCents))
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
