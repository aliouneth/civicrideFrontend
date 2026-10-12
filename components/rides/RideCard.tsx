import Link from "next/link";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Ride } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "./StatusBadge";
import { SeriesChip } from "./SeriesChip";
import { RideCardActions } from "./RideCardActions";

// Whole card is one click target (predictable, 44px+ hit area on mobile) via a
// stretched-link overlay rather than wrapping the card in an <a> — buttons
// cannot nest inside an anchor. The action row sits above the overlay.
export function RideCard({ ride, href, timeZone, hideActions }: {
  ride: Ride;
  href: string;
  timeZone?: string;
  hideActions?: boolean;
}) {
  return (
    <Card className="relative transition-transform duration-200 ease-out hover:-translate-y-0.5">
      <Link href={href} className="absolute inset-0 rounded-xl">
        <span className="sr-only">
          Open ride #{ride.id} for {ride.passenger_info.name}
        </span>
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{ride.passenger_info.name}</p>
          <p className="tnum text-sm text-ink-500">{formatDateTime(ride.scheduled_pickup_at, timeZone)}</p>
        </div>
        <StatusBadge code={ride.status.code} />
      </div>
      <SeriesChip ride={ride} className="mt-2" />

      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-semibold text-ink-500">From</dt>
          <dd>{ride.pickup_address}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 font-semibold text-ink-500">To</dt>
          <dd>{ride.dropoff_address}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3 text-sm">
        <span className="text-ink-500">
          {ride.active_assignment?.driver?.user?.name ?? "Unassigned"}
        </span>
        <span className="tnum font-semibold">{formatMoney(ride.price_cents)}</span>
      </div>

      {/* relative + z-10 keeps these clickable above the stretched overlay */}
      {!hideActions && (
        <div className="relative z-10 mt-3 border-t border-line pt-3">
          <RideCardActions
            rideId={ride.id}
            statusCode={ride.status.code}
            passengerName={ride.passenger_info.name}
          />
        </div>
      )}
    </Card>
  );
}