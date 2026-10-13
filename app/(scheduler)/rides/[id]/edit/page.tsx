import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiFetch, type Ride } from "@/lib/api";
import { toDatetimeLocal } from "@/lib/format";
import { RideCreateForm, type RideDefaults } from "../../new/_components/RideCreateForm";

export const metadata: Metadata = { title: "Edit ride" };

/** Mirrors UpdateRideRequest::EDITABLE_STATUSES — checked here too so a locked
 *  ride sends the dispatcher back to the detail page instead of a dead form. */
const EDITABLE = ["pending", "assigned"];

export default async function EditRidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const ride = await apiFetch<Ride>(`/rides/${id}`, session).catch(() => null);
  if (!ride) notFound();

  if (!EDITABLE.includes(ride.status.code)) {
    redirect(`/rides/${ride.id}/assign`);
  }

  const defaults: RideDefaults = {
    passenger_name: ride.passenger_info.name,
    passenger_phone: ride.passenger_info.phone,
    additional_riders: ride.passenger_info.additional_riders ?? 0,
    destination_phone: ride.passenger_info.destination_phone ?? null,
    scheduled_pickup_at: toDatetimeLocal(ride.scheduled_pickup_at),
    pickup_address: ride.pickup_address,
    pickup_lat: ride.pickup_lat,
    pickup_lng: ride.pickup_lng,
    dropoff_address: ride.dropoff_address,
    dropoff_lat: ride.dropoff_lat,
    dropoff_lng: ride.dropoff_lng,
    notes: ride.notes,
    wheelchair: ride.passenger_info.wheelchair,
    child_seat: ride.passenger_info.child_seat,
    trip_type: ride.trip_type,
    return_pickup_at: ride.return_pickup_at ? toDatetimeLocal(ride.return_pickup_at) : undefined,
    return_ride_id: ride.return_ride_id,
    outbound_ride_id: ride.outbound_ride?.id ?? null,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/rides/${ride.id}/assign`} className="text-sm font-semibold text-brand-700 hover:underline">
        ← Back to ride #{ride.id}
      </Link>

      <h1 className="mt-3 text-2xl font-bold">Edit ride #{ride.id}</h1>
      <p className="mt-1 text-sm text-ink-500">
        Correct the booking details. Status, driver assignment and recurring groups are
        managed from the ride page.
      </p>

      <div className="mt-6 rounded-xl border border-line bg-card p-6">
        <RideCreateForm mode="edit" rideId={ride.id} defaults={defaults} />
      </div>
    </div>
  );
}