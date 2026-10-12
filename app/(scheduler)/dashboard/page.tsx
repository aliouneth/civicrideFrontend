import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { apiFetch, type Board, type BoardGrouping } from "@/lib/api";
import { RideCard } from "@/components/rides/RideCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { GroupByPicker } from "./_components/GroupByPicker";
import { ViewModePicker } from "./_components/ViewModePicker";
import { BoardFilters } from "./_components/BoardFilters";
import { CalendarView } from "./_components/CalendarView";
import { RidesTable } from "./_components/RidesTable";

export const metadata: Metadata = { title: "Dispatch board" };

const GROUPINGS: BoardGrouping[] = ["day", "series", "passenger", "driver", "none"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Server Component: dispatch data fetched with explicit no-store (live ops data).
export default async function SchedulerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ by?: string; q?: string; time_window?: string; start_date?: string; end_date?: string; unassigned?: string; series_only?: string; include_completed?: string; view?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const grouping: BoardGrouping = GROUPINGS.includes(params.by as BoardGrouping)
    ? (params.by as BoardGrouping)
    : "day";

  const TIME_WINDOWS = [
    { value: "next-7", days: 7, pastDays: 0 },
    { value: "next-14", days: 14, pastDays: 0 },
    { value: "next-30", days: 30, pastDays: 0 },
    { value: "next-60", days: 60, pastDays: 0 },
    { value: "next-90", days: 90, pastDays: 0 },
    { value: "week", days: 7, pastDays: 7 },
    { value: "fortnight", days: 14, pastDays: 14 },
    { value: "month", days: 30, pastDays: 30 },
    { value: "quarter", days: 90, pastDays: 90 },
  ];

  const windowValue = params.time_window ?? "next-14";
  const windowDef = TIME_WINDOWS.find(w => w.value === windowValue) ?? TIME_WINDOWS[1];
  const days = windowDef.days;
  const pastDays = windowDef.pastDays;
  const q = (params.q ?? "").slice(0, 120);
  const unassigned = params.unassigned === "1";
  const seriesOnly = params.series_only === "1";
  const includeCompleted = params.include_completed === "1";
  const viewMode = (params.view === "calendar" ? "calendar" : params.view === "table" ? "table" : "grouped") as "grouped" | "calendar" | "table";

  // Custom Start/End dates are mutually exclusive with Time window: when either
  // bound is set, the board is bounded exactly by the dates the user picked.
  const startDate = DATE_RE.test(params.start_date ?? "") ? (params.start_date as string) : "";
  const endDate = DATE_RE.test(params.end_date ?? "") ? (params.end_date as string) : "";
  const hasDateRange = startDate !== "" || endDate !== "";

  const query = new URLSearchParams({
    by: grouping,
    ...(hasDateRange
      ? { ...(startDate ? { start_date: startDate } : {}), ...(endDate ? { end_date: endDate } : {}) }
      : { days: String(days), past_days: String(pastDays) }),
    ...(q ? { q } : {}),
    ...(unassigned ? { unassigned: "1" } : {}),
    ...(seriesOnly ? { series_only: "1" } : {}),
    ...(includeCompleted ? { include_completed: "1" } : {}),
  });

  const board = await apiFetch<Board>(`/rides/board?${query}`, session).catch(() => null);

  const filtering = hasDateRange || q !== "" || unassigned || seriesOnly || days !== 14 || pastDays !== 0 || includeCompleted;

  if (!board) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Dispatch board</h1>
        <div className="mt-6">
          <EmptyState title="Board unavailable" body="Could not reach the dispatch API. Check that the service is running." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dispatch board</h1>
        <Link href="/rides/new"><Button variant="accent">New ride</Button></Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Suspense fallback={<div className="h-11" />}>
          <GroupByPicker value={grouping} />
        </Suspense>
        <Suspense fallback={<div className="h-11" />}>
          <ViewModePicker value={viewMode} />
        </Suspense>
      </div>

      <div className="mt-4">
        <BoardFilters state={{ by: grouping, q, unassigned, seriesOnly, days, pastDays, includeCompleted, startDate, endDate }} />
      </div>

      <p className="tnum mt-3 text-sm text-ink-500" role="status">
        {board.total} ride(s){hasDateRange
          ? startDate && endDate
            ? ` from ${startDate} to ${endDate}`
            : startDate
              ? ` from ${startDate}`
              : ` until ${endDate}`
          : ` over the next ${board.window_days} days`
        }
        {!hasDateRange && board.past_days != null && board.past_days > 0 && `, looking back ${board.past_days} day${board.past_days === 1 ? "" : "s"}`}
        {board.include_completed && ", including completed"}
        {filtering && " matching your filters"}
        {board.truncated && " — showing the first 200"}
      </p>

      {viewMode === "calendar" ? (
        <CalendarView groups={board.groups} />
      ) : board.groups.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={filtering ? "No rides match" : "Board is clear"}
            body={
              filtering
                ? "Try a shorter search term, widen the window, or clear the quick filters."
                : "No open rides in this window. New requests from passengers or phone bookings will appear here."
            }
          />
        </div>
      ) : viewMode === "table" ? (
        <RidesTable groups={board.groups} />
      ) : (
        <div className="mt-4 space-y-8">
          {board.groups.map((group) => (
            <section key={group.key}>
              <div className="flex flex-wrap items-baseline gap-2 border-b border-line pb-2">
                <h2 className="text-lg font-semibold">{group.label}</h2>
                <span className="tnum text-sm text-ink-500">{group.count}</span>
                {group.meta.series_key && (
                  <Link
                    href={`/rides/series/${group.meta.series_key}`}
                    className="text-sm font-semibold text-brand-700 hover:underline"
                  >
                    View series
                  </Link>
                )}
                {group.meta.occurrence_of && (
                  <span className="tnum text-sm text-ink-500">
                    up to occurrence {group.meta.occurrence_of}
                  </span>
                )}
                {group.meta.series_count ? (
                  <span className="text-sm text-ink-500">
                    across {group.meta.series_count} series
                  </span>
                ) : null}
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.rides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} href={`/rides/${ride.id}/assign`} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}