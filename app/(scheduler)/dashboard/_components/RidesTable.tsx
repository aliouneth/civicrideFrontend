import Link from "next/link";
import type { BoardGroup } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import { statusMeta } from "@/lib/ride-status";

// Compact data-grid view of the dispatch board: one row per ride, with the
// grouping bucket (day / series / passenger / driver) as the first column so
// the grid stays meaningful no matter how the board is grouped.
export function RidesTable({ groups }: { groups: BoardGroup[] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-paper text-xs uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3 text-left font-semibold">Group</th>
              <th className="px-4 py-3 text-left font-semibold">Scheduled</th>
              <th className="px-4 py-3 text-left font-semibold">Passenger</th>
              <th className="px-4 py-3 text-left font-semibold">Route</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Driver</th>
              <th className="tnum px-4 py-3 text-right font-semibold">Price</th>
              <th className="px-4 py-3 text-right font-semibold" />
            </tr>
          </thead>
          <tbody>
            {groups.map((group) =>
              group.rides.map((ride) => {
                const meta = statusMeta(ride.status.code);
                const driverName = ride.active_assignment?.driver?.user?.name ?? null;
                return (
                  <tr key={ride.id} className="border-t border-line transition-colors hover:bg-brand-50/40">
                    <td className="whitespace-nowrap px-4 py-3 text-ink-500">{group.label}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-900">
                      {formatDateTime(ride.scheduled_pickup_at)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink-900">{ride.passenger_info.name}</p>
                      {ride.passenger_info.phone && (
                        <p className="tnum text-xs text-ink-500">{ride.passenger_info.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[200px] truncate text-ink-900" title={ride.pickup_address}>
                        {ride.pickup_address}
                      </p>
                      <p className="max-w-[200px] truncate text-xs text-ink-500" title={ride.dropoff_address}>
                        → {ride.dropoff_address}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold ${meta.classes}`}>
                        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-900">
                      {driverName ?? "—"}
                    </td>
                    <td className="tnum whitespace-nowrap px-4 py-3 text-right">
                      {formatMoney(ride.price_cents)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/rides/${ride.id}/assign`}
                        className="text-sm font-semibold text-brand-700 hover:underline"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}