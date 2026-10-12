"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { statusMeta } from "@/lib/ride-status";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Ride } from "@/lib/api";

interface DriverOption {
  id: number;
  name: string;
}

interface Report {
  driver: { id: number; name: string };
  month: string;
  summary: {
    rides: number;
    completed: number;
    cancelled: number;
    fare_cents: number;
    distance_miles: number;
  };
  rides: Ride[];
}

const ATTESTABLE_STATUSES = new Set(["completed", "cancelled"]);

const DISCLAIMER_TEXT = `I declare this account of daily expenses is true and correct. These are actual, reasonable and necessary expenses incurred by me in the performance of my duties required by the public service. No part of this account has been previously reimbursed to me. I certify that I have read and understand the Vehicle Usage Policy (Admin Rule AR05-01) and the Travel Regulation Policy (Admin Rule AR04-01) and do adhere to all provisions of them. These Admin Rules can be obtained from the County's intranet site on the County Executives page or contact your department head or supervisor for a copy.`;

// Current month as "YYYY-MM" (UTC: near month boundaries the driver's webzone
// may still be the previous month, but the picker lets them choose any month).
function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(`${key}-01T00:00:00Z`));
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function RidesTable({ rides }: { rides: Ride[] }) {
  if (rides.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-line bg-card px-4 py-6 text-center text-sm text-ink-500">
        No rides for this month.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-line bg-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-500">
            <th className="px-3 py-2">When</th>
            <th className="px-3 py-2">Passenger</th>
            <th className="px-3 py-2">Route</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Fare</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rides.map((ride) => {
            const meta = statusMeta(ride.status?.code ?? "");
            return (
              <tr key={ride.id} className="transition-colors hover:bg-ink-50">
                <td className="tnum whitespace-nowrap px-3 py-2.5">
                  {formatDateTime(ride.scheduled_pickup_at)}
                </td>
                <td className="px-3 py-2.5 font-medium">{ride.passenger_info?.name ?? "—"}</td>
                <td className="max-w-[10rem] px-3 py-2.5 text-ink-600">
                  <span className="block truncate">{ride.pickup_address}</span>
                  <span className="block truncate">→ {ride.dropoff_address}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${meta.classes}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                </td>
                <td className="tnum px-3 py-2.5 text-right font-semibold">
                  {formatMoney(ride.price_cents)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-line bg-ink-50 font-semibold">
            <td className="px-3 py-2.5" colSpan={4}>
              Total
            </td>
            <td className="tnum px-3 py-2.5 text-right">
              {formatMoney(
                rides.reduce(
                  (sum, ride) => sum + (ride.status?.code === "completed" ? (ride.price_cents ?? 0) : 0),
                  0,
                ),
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/**
 * Monthly driver rides report.
 * - mode "self": the logged-in driver's own rides (driver app).
 * - mode "any": pick any of the agency's drivers (scheduler reports page).
 * Fetched through the BFF proxy so the tenant cookie/header always applies.
 */
export function DriverRideReport({ mode }: { mode: "self" | "any" }) {
  const [month, setMonth] = useState(currentMonthKey());
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [driverId, setDriverId] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attesting, setAttesting] = useState(false);
  const [attestedIds, setAttestedIds] = useState<Set<number>>(new Set());
  const [attestMessage, setAttestMessage] = useState<string | null>(null);

  async function loadDrivers() {
    try {
      const res = await fetch("/api/drivers?page=100");
      if (!res.ok) throw new Error("Could not load the driver list.");
      const body = await res.json();
      const options: DriverOption[] = (body?.data ?? []).map((d: { id: number; user?: { name?: string } }) => ({
        id: d.id,
        name: d.user?.name ?? `Driver #${d.id}`,
      }));
      setDrivers(options);
      if (options.length > 0) setDriverId(String(options[0].id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load drivers.");
    }
  }

  async function attest() {
    if (!report) return;
    const attestable = report.rides.filter((r) => ATTESTABLE_STATUSES.has(r.status?.code ?? ""));
    if (attestable.length === 0) {
      setError("No attestable rides (only completed or cancelled).");
      return;
    }
    setAttesting(true);
    setError(null);
    setAttestMessage(null);
    try {
      const res = await fetch("/api/drivers/me/rides/attest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_ids: attestable.map((r) => r.id) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Attestation failed.");
      }
      const body = (await res.json()) as { attested: number };
      setAttestedIds((prev) => {
        const next = new Set(prev);
        attestable.forEach((r) => next.add(r.id));
        return next;
      });
      setAttestMessage(`${body.attested} ride(s) attested.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Attestation failed.");
    } finally {
      setAttesting(false);
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ month });
      if (mode === "any" && driverId) params.set("driver_profile_id", driverId);
      const res = await fetch(`/api/drivers/report?${params}`);
      if (!res.ok) throw new Error("Could not load the report.");
      setReport(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          {mode === "any" && (
            <label className="flex flex-col gap-1 text-sm font-medium text-ink-700">
              Driver
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                onFocus={() => {
                  if (drivers.length === 0) void loadDrivers();
                }}
                className="rounded-lg border border-line bg-card px-3 py-2.5 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                {drivers.length === 0 && <option value="">Loading…</option>}
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
          )}
          <Input type="month" label="Month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <Button loading={loading} onClick={() => void load()}>
            Load report
          </Button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-bad-fg">{error}</p>}
      </Card>

      {report && (
        <>
          <h2 className="mt-6 text-lg font-semibold">Monthly rides</h2>
          <p className="text-sm text-ink-500">
            {report.driver.name} — {monthLabel(report.month)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Card><Stat label="Total rides" value={String(report.summary.rides ?? 0)} /></Card>
            <Card><Stat label="Completed" value={String(report.summary.completed ?? 0)} /></Card>
            <Card><Stat label="Cancelled" value={String(report.summary.cancelled ?? 0)} /></Card>
            <Card><Stat label="Fares" value={formatMoney(report.summary.fare_cents ?? 0)} /></Card>
            <Card><Stat label="Distance" value={`${report.summary.distance_miles ?? 0} mi`} /></Card>
          </div>
          <RidesTable rides={report.rides} />

          {mode === "self" && (
            <div className="mt-6 rounded-xl border border-bad-fg/30 bg-bad-bg p-5">
              <p className="text-sm leading-relaxed text-ink-700">{DISCLAIMER_TEXT}</p>
              <div className="mt-4">
                <Button variant="danger" loading={attesting} onClick={attest}>
                  I attest
                </Button>
              </div>
              {attestMessage && (
                <p role="status" className="mt-3 text-sm font-medium text-ok-fg">{attestMessage}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}