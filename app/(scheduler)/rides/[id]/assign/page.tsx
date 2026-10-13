import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiFetch, type CursorPage, type Ride, type RideEvent } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/rides/StatusBadge";
import { RideTimeline } from "@/components/rides/RideTimeline";
import { SeriesChip } from "@/components/rides/SeriesChip";
import { AssignmentPicker } from "@/components/rides/AssignmentPicker";
import { CancelRideButton } from "./_components/CancelRideButton";

export const metadata: Metadata = { title: "Assign ride" };

interface DriverRow {
  id: number; user?: { name: string }; active_assignments_count?: number;
}

// Server Component: ride detail + eligible drivers, assignment posted by the leaf.
export default async function AssignPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const ride = await apiFetch<Ride & { events: RideEvent[] }>(`/rides/${id}`, session).catch(() => null);
  if (!ride) notFound();

  const drivers = await apiFetch<CursorPage<DriverRow>>("/drivers", session).catch(() =>
    ({ data: [], next_cursor: null, next_page_url: null, prev_cursor: null }),
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Ride #{ride.id}</h1>
          <StatusBadge code={ride.status.code} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SeriesChip ride={ride} href={`/rides/series/${ride.series_key}`} />
          {ride.trip_type === "roundtrip" && (
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800">
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              Round trip{ride.return_pickup_at ? ` · back ${formatDateTime(ride.return_pickup_at)}` : ""}
            </span>
          )}
          {ride.outbound_ride && (
            <Link href={`/rides/${ride.outbound_ride.id}/assign`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-paper px-2 py-0.5 text-xs font-semibold text-ink-500 hover:underline">
              ↩ Return leg of ride #{ride.outbound_ride.id}
            </Link>
          )}
          <Link href={`/rides/new?clone=${ride.id}`}>
            <Button variant="ghost" className="border-brand-300 bg-brand-50 text-brand-800 hover:bg-brand-100">
              Clone ride
            </Button>
          </Link>
        </div>
        <Card className="mt-4">
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-ink-500">Passenger</dt><dd>{ride.passenger_info.name} · {ride.passenger_info.phone}{(ride.passenger_info.additional_riders ?? 0) > 0 && ` · +${ride.passenger_info.additional_riders} additional`}</dd></div>
            {ride.passenger_info.destination_phone && (
              <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-ink-500">Dest. phone</dt><dd><a href={`tel:${ride.passenger_info.destination_phone}`} className="font-semibold text-brand-700 hover:underline">{ride.passenger_info.destination_phone}</a></dd></div>
            )}
            <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-ink-500">Pickup</dt><dd>{ride.pickup_address}<br /><span className="tnum text-ink-500">{formatDateTime(ride.scheduled_pickup_at)}</span></dd></div>
            <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-ink-500">Drop-off</dt><dd>{ride.dropoff_address}</dd></div>
            <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-ink-500">Trip</dt><dd>
              {ride.trip_type === "roundtrip" ? "Round trip" : "One-way"}
              {ride.return_ride && (
                <> · return as <Link href={`/rides/${ride.return_ride.id}/assign`} className="font-semibold text-brand-700 hover:underline">ride #{ride.return_ride.id}</Link>
                <span className="tnum text-ink-500"> ({formatDateTime(ride.return_ride.scheduled_pickup_at)})</span></>
              )}
            </dd></div>
            {ride.trip_type === "roundtrip" && !ride.return_ride && ride.return_pickup_at && (
              <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-ink-500">Return</dt><dd className="tnum">{formatDateTime(ride.return_pickup_at)}<span className="text-ink-500"> — same ride, driver runs both directions</span></dd></div>
            )}
            <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-ink-500">Fare</dt><dd className="tnum">{formatMoney(ride.price_cents)}</dd></div>
            {ride.total_distance_miles != null && (
              <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-ink-500">Distance</dt><dd className="tnum">{ride.total_distance_miles} mi</dd></div>
            )}
            {ride.notes && <div className="flex gap-2"><dt className="w-24 shrink-0 font-semibold text-ink-500">Notes</dt><dd>{ride.notes}</dd></div>}
          </dl>
        </Card>
        <Card className="mt-4">
          <h2 className="font-semibold">Activity</h2>
          <div className="mt-3"><RideTimeline events={ride.events ?? []} /></div>
        </Card>
      </div>
      <div>
        <Card>
          <h2 className="font-semibold">Assign a driver</h2>
          {["pending", "assigned", "en_route"].includes(ride.status.code) && (
            <div className="mb-4 border-b border-line pb-4">
              <CancelRideButton rideId={ride.id} />
            </div>
          )}
          <div className="mt-3">
            {["pending", "assigned"].includes(ride.status.code) ? (
              <AssignmentPicker
                rideId={ride.id}
                drivers={drivers.data.map((d) => ({
                  id: d.id, name: d.user?.name ?? `Driver #${d.id}`,
                  activeCount: d.active_assignments_count ?? 0,
                }))}
              />
            ) : (
              <p className="text-sm text-ink-500">
                This ride is {ride.status.code.replace("_", " ")} and cannot be assigned.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
