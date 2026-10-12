import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiFetch, type RideSeriesDetail } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { RideCard } from "@/components/rides/RideCard";
import { SeriesActions } from "@/components/rides/SeriesActions";

export const metadata: Metadata = { title: "Recurring series" };

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ seriesKey: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { seriesKey } = await params;
  const series = await apiFetch<RideSeriesDetail>(
    `/ride-series/${encodeURIComponent(seriesKey)}`,
    session,
  ).catch(() => null);

  if (!series) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/rides/series" className="text-sm font-semibold text-brand-700 hover:underline">
        ← All recurring groups
      </Link>

      <h1 className="mt-3 text-2xl font-bold">{series.label || "Unnamed series"}</h1>
      <p className="tnum mt-1 text-sm text-ink-500">
        {series.occurrences} occurrence(s) · {series.rides.filter((r) => !r.status.is_terminal).length} open
      </p>

      <Card className="mt-4">
        <h2 className="font-semibold">Series actions</h2>
        <p className="mt-1 text-sm text-ink-500">
          Applies to every occurrence below. Rides already in motion are never moved.
        </p>
        <div className="mt-3">
          <SeriesActions
            seriesKey={series.series_key}
            label={series.label || "this series"}
            openCount={series.rides.filter((r) => !r.status.is_terminal).length}
            occurrences={series.occurrences}
          />
        </div>
      </Card>

      <h2 className="mt-8 text-lg font-semibold">Occurrences</h2>
      <ol className="mt-3 space-y-3">
        {series.rides.map((ride) => (
          <li key={ride.id} className="flex items-start gap-3">
            <span
              aria-hidden
              className="tnum mt-3 w-10 shrink-0 text-right text-sm font-semibold text-ink-500"
            >
              #{ride.occurrence_index === null || ride.occurrence_index === undefined
                ? "—"
                : ride.occurrence_index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <RideCard ride={ride} href={`/rides/${ride.id}/assign`} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}