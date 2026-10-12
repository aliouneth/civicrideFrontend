import Link from "next/link";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Ride } from "@/lib/api";

// Monthly completed-ride history. The table row is the click target: the
// stretched link sits inside the last cell but is positioned against the
// relative <tr>, so the whole row opens the ride detail.
export function CompletedRidesTable({ rides }: { rides: Ride[] }) {
  if (rides.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-line bg-card px-4 py-6 text-center text-sm text-ink-500">
        No completed rides for this month.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-line bg-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-500">
            <th className="px-3 py-2">Done</th>
            <th className="px-3 py-2">Passenger</th>
            <th className="px-3 py-2">Route</th>
            <th className="px-3 py-2 text-right">Fare</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rides.map((ride) => (
            <tr key={ride.id} className="relative transition-colors hover:bg-ink-50">
              <td className="tnum whitespace-nowrap px-3 py-2.5">
                {formatDateTime(ride.scheduled_pickup_at)}
              </td>
              <td className="px-3 py-2.5 font-medium">{ride.passenger_info.name}</td>
              <td className="max-w-[10rem] px-3 py-2.5 text-ink-600">
                <span className="block truncate">{ride.pickup_address}</span>
                <span className="block truncate">→ {ride.dropoff_address}</span>
              </td>
              <td className="px-3 py-2.5 text-right font-semibold tnum">
                {formatMoney(ride.price_cents)}
                <Link
                  href={`/driver/rides/${ride.id}`}
                  className="absolute inset-0 rounded-xl"
                  aria-label={`Open completed ride #${ride.id}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}