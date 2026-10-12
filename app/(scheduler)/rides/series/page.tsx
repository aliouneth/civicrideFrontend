import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiFetch, type RideSeriesSummary } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SeriesActions } from "@/components/rides/SeriesActions";

export const metadata: Metadata = { title: "Recurring groups" };

function ruleSummary(s: RideSeriesSummary): string {
  const r = s.recurrence;
  if (!r) return "No rule recorded";

  const every = r.interval === 1
    ? r.frequency
    : `${r.frequency}, every ${r.interval}`;

  const bound = r.count
    ? `${r.count} rides`
    : r.until
      ? `until ${new Date(r.until).toLocaleDateString()}`
      : "open-ended";

  return `${every} · ${bound}`;
}

export default async function SeriesIndexPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data } = await apiFetch<{ data: RideSeriesSummary[] }>("/ride-series", session).catch(
    () => ({ data: [] as RideSeriesSummary[] }),
  );

  const open = data.filter((s) => s.open_count > 0);
  const closed = data.filter((s) => s.open_count === 0);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">Recurring groups</h1>
      <p className="mt-1 text-sm text-ink-500">
        Every ride created from a recurring request, grouped by its series. Bulk actions
        apply to the whole series.
      </p>

      {data.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No recurring rides yet"
            body="Tick “Repeat this ride” when creating a ride to group a schedule together."
          />
        </div>
      ) : (
        <>
          <h2 className="mt-6 text-lg font-semibold">Active ({open.length})</h2>
          {open.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="Nothing active" body="Every series has been fully completed or cancelled." />
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {open.map((s) => <SeriesCard key={s.series_key} series={s} />)}
            </div>
          )}

          {closed.length > 0 && (
            <>
              <h2 className="mt-8 text-lg font-semibold">Finished ({closed.length})</h2>
              <div className="mt-3 space-y-4">
                {closed.map((s) => <SeriesCard key={s.series_key} series={s} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function SeriesCard({ series }: { series: RideSeriesSummary }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">
            <Link href={`/rides/series/${series.series_key}`} className="hover:underline">
              {series.label || "Unnamed series"}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-ink-500">{ruleSummary(series)}</p>
          <p className="tnum mt-1 text-sm text-ink-500">
            {series.occurrences} ride(s) · {series.open_count} open · first{" "}
            {formatDateTime(series.first_pickup_at ?? "")}
            {series.next_pickup_at && ` · next ${formatDateTime(series.next_pickup_at)}`}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <SeriesActions
          seriesKey={series.series_key}
          label={series.label || "this series"}
          openCount={series.open_count}
          occurrences={series.occurrences}
        />
      </div>
    </Card>
  );
}