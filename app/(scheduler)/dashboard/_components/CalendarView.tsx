"use client";

import { useMemo, useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  isSameMonth,
  isSameDay,
} from "date-fns";
import Link from "next/link";

type ViewMode = "day" | "week" | "month";

interface CalendarRide {
  id: number | string;
  scheduled_pickup_at: string;
  passenger_info?: { name?: string } | null;
}

interface CalendarViewProps {
  groups: { label: string; rides: CalendarRide[] }[];
}

function dayKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function dayRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let d = new Date(start);
  while (d <= end) {
    days.push(new Date(d));
    d = addDays(d, 1);
  }
  return days;
}

export function CalendarView({ groups }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());

  const ridesByDate = useMemo(() => {
    const map = new Map<string, (CalendarRide & { groupLabel: string })[]>();
    groups.forEach((group) => {
      group.rides.forEach((ride) => {
        const key = dayKey(new Date(ride.scheduled_pickup_at));
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ ...ride, groupLabel: group.label });
      });
    });
    return map;
  }, [groups]);

  const getRidesForDate = (date: Date) => ridesByDate.get(dayKey(date)) || [];

  const navigate = (direction: 1 | -1) => {
    setAnchorDate((d) => {
      if (viewMode === "day") return addDays(d, direction);
      if (viewMode === "week") return addWeeks(d, direction);
      return addMonths(d, direction);
    });
  };

  const goToday = () => setAnchorDate(new Date());

  const rangeLabel = useMemo(() => {
    if (viewMode === "day") return format(anchorDate, "EEEE, MMMM d, yyyy");
    if (viewMode === "week") {
      const start = startOfWeek(anchorDate, { weekStartsOn: 1 });
      const end = endOfWeek(anchorDate, { weekStartsOn: 1 });
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    return format(anchorDate, "MMMM yyyy");
  }, [viewMode, anchorDate]);

  const days = useMemo(() => {
    if (viewMode === "day") return [anchorDate];
    if (viewMode === "week") {
      return dayRange(
        startOfWeek(anchorDate, { weekStartsOn: 1 }),
        endOfWeek(anchorDate, { weekStartsOn: 1 }),
      );
    }
    const start = startOfWeek(startOfMonth(anchorDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(anchorDate), { weekStartsOn: 1 });
    return dayRange(start, end);
  }, [viewMode, anchorDate]);

  const totalRides = useMemo(() => {
    return days.reduce((sum, d) => sum + getRidesForDate(d).length, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, ridesByDate]);

  const renderDayCell = (date: Date, expanded: boolean) => {
    const rides = getRidesForDate(date);
    const isToday = isSameDay(date, new Date());
    const inMonth = isSameMonth(date, anchorDate);
    const dimmed = viewMode === "month" && !inMonth;

    if (viewMode === "day") {
      return (
        <div key={dayKey(date)} className="rounded-xl border border-line bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className={`text-lg font-semibold ${isToday ? "text-brand-700" : "text-ink-900"}`}>
              {format(date, "EEEE, MMMM d, yyyy")}
              {isToday && (
                <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  Today
                </span>
              )}
            </span>
            <span className="tnum text-sm text-ink-500">
              {rides.length} ride{rides.length === 1 ? "" : "s"}
            </span>
          </div>
          {rides.length === 0 ? (
            <p className="text-sm text-ink-500">No rides scheduled for this day.</p>
          ) : (
            <ul className="space-y-2">
              {rides.map((ride) => (
                <li key={ride.id}>
                  <Link
                    href={`/rides/${ride.id}/assign`}
                    className="flex items-center justify-between rounded-lg border border-line px-3 py-2 hover:bg-brand-50"
                  >
                    <span className="font-medium">{ride.passenger_info?.name ?? "Passenger"}</span>
                    <span className="text-sm text-ink-500">{ride.groupLabel}</span>
                    <span className="tnum text-sm text-ink-700">
                      {format(new Date(ride.scheduled_pickup_at), "h:mm a")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    return (
      <div
        key={dayKey(date)}
        className={`relative border-r border-b border-line transition-colors ${
          isToday ? "bg-brand-50 ring-2 ring-inset ring-brand-600" : "bg-card"
        } ${dimmed ? "opacity-40" : ""}`}
        style={{ minHeight: expanded ? "140px" : "110px" }}
      >
        <div className="flex items-center justify-between px-2 pt-1.5">
          <span className={`text-sm font-semibold ${isToday ? "text-brand-700" : "text-ink-900"}`}>
            {format(date, viewMode === "week" ? "EEE d" : "d")}
          </span>
          {rides.length > 0 && (
            <span className="tnum rounded-full bg-brand-100 px-1.5 py-0.5 text-xs font-semibold text-brand-700">
              {rides.length}
            </span>
          )}
        </div>
        {rides.length > 0 && (
          <div className="mt-1.5 space-y-1 px-1.5 pb-1.5">
            {rides.slice(0, expanded ? 8 : 3).map((ride) => (
              <Link
                key={ride.id}
                href={`/rides/${ride.id}/assign`}
                className="block truncate rounded bg-brand-50 px-1.5 py-1 text-xs hover:bg-brand-100"
                title={`${ride.groupLabel}: ${ride.passenger_info?.name ?? ""}`}
              >
                {ride.passenger_info?.name ?? "Passenger"}
              </Link>
            ))}
            {rides.length > (expanded ? 8 : 3) && (
              <div className="tnum text-center text-xs text-ink-500">
                +{rides.length - (expanded ? 8 : 3)} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-500">View:</span>
          <div className="flex gap-1 rounded-lg border border-line bg-card p-1">
            {(["day", "week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-pressed={viewMode === mode}
                className={`flex min-h-[36px] items-center rounded-md px-3 text-sm font-semibold transition-colors ${
                  viewMode === mode
                    ? "bg-brand-600 text-white"
                    : "text-ink-500 hover:bg-brand-50 hover:text-brand-700"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={`Previous ${viewMode}`}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-card text-ink-700 hover:bg-brand-50"
          >
            ‹
          </button>
          <span className="tnum min-w-[180px] text-center text-sm font-semibold text-ink-900">
            {rangeLabel}
          </span>
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label={`Next ${viewMode}`}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-card text-ink-700 hover:bg-brand-50"
          >
            ›
          </button>
          <button
            type="button"
            onClick={goToday}
            className="min-h-[36px] rounded-md border border-line bg-card px-3 text-sm font-semibold text-ink-700 hover:bg-brand-50"
          >
            Today
          </button>
        </div>
      </div>

      <p className="tnum text-sm text-ink-500" role="status">
        {totalRides} ride{totalRides === 1 ? "" : "s"} in this {viewMode}
      </p>

      {viewMode === "day" ? (
        renderDayCell(anchorDate, true)
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="grid grid-cols-7 border-b border-line bg-brand-50">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-1 py-2 text-center text-xs font-semibold text-ink-500">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((date) => renderDayCell(date, viewMode === "week"))}
          </div>
        </div>
      )}
    </div>
  );
}
