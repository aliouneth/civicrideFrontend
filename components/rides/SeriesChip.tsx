import Link from "next/link";
import type { Ride } from "@/lib/api";

interface Props {
  ride: Ride;
  /** Omit inside an existing link (e.g. RideCard) — anchors cannot nest. */
  href?: string;
  className?: string;
}

/**
 * Marks a ride as part of a recurring series. The dot plus the "n of m" text mean
 * the grouping is never carried by colour alone (design system §2).
 */
export function SeriesChip({ ride, href, className = "" }: Props) {
  if (!ride.series_key) return null;

  const total = ride.recurrence?.count ?? null;
  const position = ride.occurrence_index === null || ride.occurrence_index === undefined
    ? null
    : ride.occurrence_index + 1;

  const inner = (
    <>
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
      <span className="truncate">{ride.series_label || "Unnamed series"}</span>
      {position !== null && (
        <span className="tnum shrink-0 text-brand-700">
          {position}{total ? ` of ${total}` : ""}
        </span>
      )}
    </>
  );

  const skin = `inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800 ${className}`;

  return href
    ? <Link href={href} className={`${skin} hover:bg-brand-100`}>{inner}</Link>
    : <span className={skin}>{inner}</span>;
}