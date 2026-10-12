"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { DriverListItem } from "./types";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "approved":
      return "border-transparent bg-ok-bg text-ok-fg";
    case "suspended":
    case "rejected":
      return "border-transparent bg-bad-bg text-bad-fg";
    default:
      // applied, pending, documents_pending, in_review
      return "border-transparent bg-warn-bg text-warn-fg";
  }
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function vehicleSummary(d: DriverListItem): string {
  const parts = [d.vehicle_make, d.vehicle_model, d.vehicle_year]
    .filter(Boolean)
    .join(" ");
  return parts || "—";
}

function homeBase(d: DriverListItem): string | null {
  if (!d.home_address) return null;
  const coords =
    d.home_lat != null && d.home_lng != null
      ? ` (${Number(d.home_lat).toFixed(3)}, ${Number(d.home_lng).toFixed(3)})`
      : "";
  return `${d.home_address}${coords}`;
}

function dateOnly(iso: string | null): string | null {
  return iso ? iso.slice(0, 10) : null;
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false;
  const expiry = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return expiry < new Date();
}

export function DriversGrid({ drivers }: { drivers: DriverListItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function review(driver: DriverListItem, decision: "suspended" | "approved") {
    const verb = decision === "suspended" ? "suspend" : "restore";
    const name = driver.user.name;
    const confirmMessage =
      decision === "suspended"
        ? `Suspend ${name}? They won't be assignable until restored.`
        : `Restore ${name}? They become assignable again.`;
    if (!window.confirm(confirmMessage)) return;

    setBusyId(driver.id);
    setActionError(null);
    try {
      const res = await fetch(`/api/drivers/review/${driver.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Could not ${verb} driver.`);
      }
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : `Could not ${verb} driver.`);
    } finally {
      setBusyId(null);
    }
  }

  if (drivers.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-card p-10 text-center">
        <p className="text-sm font-semibold text-ink-900">No drivers found</p>
        <p className="mt-1 text-sm text-ink-500">
          Drivers appear here once they've registered and applied to your agency.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
      {actionError && (
        <p role="alert" className="border-b border-line bg-bad-bg px-4 py-2 text-sm font-medium text-bad-fg">
          {actionError}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-paper text-xs uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3 text-left font-semibold">Driver</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Vehicle</th>
              <th className="px-4 py-3 text-left font-semibold">Home base</th>
              <th className="px-4 py-3 text-left font-semibold">License</th>
              <th className="px-4 py-3 text-center font-semibold">Assignments</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => {
              const name = driver.user.name;
              const suspended = driver.onboarding_status === "suspended";
              const licenseExpiry = dateOnly(driver.license_expiry);
              const home = homeBase(driver);
              const rowBusy = busyId === driver.id;
              return (
                <tr key={driver.id} className="border-t border-line transition-colors hover:bg-brand-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                        {initials(name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink-900">{name}</p>
                        <p className="truncate text-ink-500">{driver.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusBadgeClass(driver.onboarding_status)}>
                      <span
                        aria-hidden
                        className={`h-1.5 w-1.5 rounded-full ${
                          driver.onboarding_status === "approved"
                            ? "bg-ok-fg"
                            : driver.onboarding_status === "suspended" || driver.onboarding_status === "rejected"
                              ? "bg-bad-fg"
                              : "bg-warn-fg"
                        }`}
                      />
                      {statusLabel(driver.onboarding_status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{vehicleSummary(driver)}</p>
                    <p className="text-xs text-ink-500">
                      {[driver.vehicle_color, driver.vehicle_plate].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {home ? (
                      <>
                        <p className="max-w-[220px] truncate font-medium text-ink-900" title={home}>
                          {home}
                        </p>
                        {driver.user.phone && <p className="text-xs text-ink-500">{driver.user.phone}</p>}
                      </>
                    ) : (
                      <span className="text-ink-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{driver.license_number || "—"}</p>
                    {licenseExpiry && (
                      <p className={`text-xs ${isExpired(licenseExpiry) ? "font-medium text-bad-fg" : "text-ink-500"}`}>
                        {isExpired(licenseExpiry) ? "Expired" : "Expires"} {licenseExpiry}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`tnum inline-flex min-w-[28px] items-center justify-center rounded-full px-2 py-0.5 text-sm font-semibold ${
                        driver.active_assignments_count > 0
                          ? "bg-brand-100 text-brand-800"
                          : "bg-paper text-ink-500"
                      }`}
                    >
                      {driver.active_assignments_count}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/drivers/${driver.id}/edit`}
                        aria-label={`Edit ${name}`}
                        className={`inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-semibold transition-colors duration-200 ease-out hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60 ${rowBusy ? "pointer-events-none opacity-60" : ""}`}
                      >
                        Edit
                      </Link>
                      {suspended ? (
                        <Button
                          variant="ghost"
                          className="min-h-[38px] border-transparent px-3 text-sm text-ok-fg hover:bg-ok-bg"
                          disabled={rowBusy}
                          loading={rowBusy}
                          onClick={() => review(driver, "approved")}
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button
                          variant="dangerOutline"
                          className="min-h-[38px] px-3 text-sm"
                          disabled={rowBusy}
                          loading={rowBusy}
                          onClick={() => review(driver, "suspended")}
                        >
                          Suspend
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}