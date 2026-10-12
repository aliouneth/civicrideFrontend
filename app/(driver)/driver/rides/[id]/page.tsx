import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiFetch, type Ride, type RideEvent } from "@/lib/api";
import { formatMoney, navigationUrl } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/rides/StatusBadge";
import { RideTimeline } from "@/components/rides/RideTimeline";
import { ExecutionControls } from "./_components/ExecutionControls";

export const metadata: Metadata = { title: "Ride" };

// Separate, clickable addresses: the whole line opens navigation to that stop.
function AddressLine({
  label,
  address,
  lat,
  lng,
  className = "",
}: {
  label: string;
  address: string;
  lat: number;
  lng: number;
  className?: string;
}) {
  const url = lat != null && lng != null ? navigationUrl(lat, lng) : null;

  return (
    <div className={`flex gap-2 ${className}`}>
      <dt className="w-16 shrink-0 font-semibold text-ink-500">{label}</dt>
      <dd>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-2 hover:decoration-brand-600"
          >
            {address} <span aria-hidden="true">↗</span>
          </a>
        ) : (
          address
        )}
      </dd>
    </div>
  );
}

// Driver execution UI: start → navigate → pickup → drop-off, one action per state.
// The backend also refuses a driver starting a ride not scheduled today.
function isScheduledToday(iso: string): boolean {
  const sched = new Date(iso);
  const now = new Date();
  return (
    sched.getUTCFullYear() === now.getUTCFullYear()
    && sched.getUTCMonth() === now.getUTCMonth()
    && sched.getUTCDate() === now.getUTCDate()
  );
}

export default async function DriverRidePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const ride = await apiFetch<Ride & { events: RideEvent[] }>(`/rides/${id}`, session).catch(() => null);
  if (!ride) notFound();

  // Same-day rides: surface the pickup time big, drop the date entirely.
  const pickupTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ride.scheduled_pickup_at));

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Ride #{ride.id}</h1>
        <StatusBadge code={ride.status.code} />
      </div>

      <Card className="mt-4">
        <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-lg font-semibold">
          <a href={`tel:${ride.passenger_info.phone}`} className="block truncate underline">{ride.passenger_info.name}</a>
        </p>
        <p className="tnum shrink-0 text-4xl font-bold tracking-tight text-ink-900">{pickupTime}</p>
      </div>
      <dl className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
        <div className="divide-y divide-line">
          <AddressLine label="Pickup" address={ride.pickup_address} lat={ride.pickup_lat} lng={ride.pickup_lng} className="py-2.5" />
          <AddressLine label="Drop-off" address={ride.dropoff_address} lat={ride.dropoff_lat} lng={ride.dropoff_lng} className="py-2.5" />
        </div>
        {ride.notes && <div className="flex gap-2"><dt className="w-16 shrink-0 font-semibold text-ink-500">Notes</dt><dd>{ride.notes}</dd></div>}
          <div className="flex gap-2"><dt className="w-16 shrink-0 font-semibold text-ink-500">Fare</dt><dd className="tnum">{formatMoney(ride.price_cents)}</dd></div>
          {ride.total_distance_miles != null && (
            <div className="flex gap-2"><dt className="w-16 shrink-0 font-semibold text-ink-500">Distance</dt><dd className="tnum">{ride.total_distance_miles} mi</dd></div>
          )}
        </dl>
        <ExecutionControls rideId={ride.id} statusCode={ride.status.code} canStart={isScheduledToday(ride.scheduled_pickup_at)} />
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold">Trip history</h2>
        <div className="mt-3"><RideTimeline events={ride.events ?? []} /></div>
      </Card>
    </div>
  );
}
