import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { apiFetch, type Ride } from "@/lib/api";
import { toDatetimeLocal } from "@/lib/format";
import { RideCreateForm, type RideDefaults } from "./_components/RideCreateForm";

export const metadata: Metadata = { title: "New ride" };

interface TenantSettings {
  settings?: { timezone?: string };
}

/**
 * `?clone=<id>` prefills the form from an existing ride. The pickup time is the
 * one field we cannot copy verbatim: the backend rejects a past pickup, and a
 * cloned ride is almost always a future re-run of the same trip — so a past
 * source time rolls forward by a week, keeping the time of day.
 */
function cloneDefaults(ride: Ride, timeZone: string): RideDefaults {
  const source = new Date(ride.scheduled_pickup_at);
  const when = source > new Date() ? source : new Date(source.getTime() + 7 * 86_400_000);

  return {
    passenger_name: ride.passenger_info.name,
    passenger_phone: ride.passenger_info.phone,
    passengers: ride.passenger_info.passengers ?? 1,
    scheduled_pickup_at: toDatetimeLocal(when.toISOString(), timeZone),
    pickup_address: ride.pickup_address,
    pickup_lat: ride.pickup_lat,
    pickup_lng: ride.pickup_lng,
    dropoff_address: ride.dropoff_address,
    dropoff_lat: ride.dropoff_lat,
    dropoff_lng: ride.dropoff_lng,
    notes: ride.notes,
    wheelchair: ride.passenger_info.wheelchair,
    child_seat: ride.passenger_info.child_seat,
  };
}

export default async function NewRidePage({
  searchParams,
}: {
  searchParams: Promise<{ clone?: string }>;
}) {
  const session = await getSession();
  if (!session) return null;

  const { clone } = await searchParams;
  const sourceId = Number(clone);
  const hasClone = Number.isInteger(sourceId) && sourceId > 0;

  const [source, tenant] = await Promise.all([
    hasClone
      ? apiFetch<Ride>(`/rides/${sourceId}`, session).catch(() => null)
      : Promise.resolve(null),
    apiFetch<TenantSettings>("/tenant", session).catch(() => null),
  ]);

  const timeZone = tenant?.settings?.timezone ?? "UTC";
  const defaults = source ? cloneDefaults(source, timeZone) : undefined;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">New ride request</h1>
      <p className="mt-1 text-sm text-ink-500">
        {source
          ? "Review the copied details, adjust anything that changed, then create."
          : "Creates a pending ride and jumps straight to driver assignment."}
      </p>

      {source && (
        <p className="mt-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
          Copied from{" "}
          <Link href={`/rides/${source.id}/assign`} className="underline underline-offset-2">
            ride #{source.id}
          </Link>{" "}
          — the passenger and route are prefilled, nothing has been saved yet.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-line bg-card p-6">
        <RideCreateForm defaults={defaults} />
      </div>
    </div>
  );
}