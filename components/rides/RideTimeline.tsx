import { formatDateTime } from "@/lib/format";
import type { RideEvent } from "@/lib/api";

// Lifecycle audit trail: from → to, who, when, with notes/incidents.
export function RideTimeline({ events, timeZone }: { events: RideEvent[]; timeZone?: string }) {
  if (events.length === 0) {
    return <p className="text-sm text-ink-500">No activity yet — the ride was just created.</p>;
  }
  return (
    <ol className="space-y-4">
      {events.map((e) => (
        <li key={e.id} className="flex gap-3">
          <span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />
          <div className="text-sm">
            <p className="font-semibold">
              {e.toStatus?.label ?? e.to_status_id}
              {e.actor && <span className="font-normal text-ink-500"> · by {e.actor.name}</span>}
            </p>
            <p className="tnum text-ink-500">{formatDateTime(e.created_at, timeZone)}</p>
            {typeof e.metadata?.note === "string" && <p className="mt-1">{e.metadata.note}</p>}
            {typeof e.metadata?.incident === "string" && (
              <p className="mt-1 font-medium text-bad-fg">Incident: {e.metadata.incident}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
