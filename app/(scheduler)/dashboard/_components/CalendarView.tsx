"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatTime } from "@/lib/format";

type ViewMode = "day" | "week" | "month";

interface CalendarRide {
  id: number | string;
  scheduled_pickup_at: string;
  passenger_info?: { name?: string } | null;
}

interface CalendarViewProps {
  groups: { label: string; rides: CalendarRide[] }[];
  timeZone?: string;
}

// The grid is calendar math, not clock math: days are held as UTC-midnight
// "calendar days" so the server (UTC) and every browser render an identical
// grid. Only ride grouping and the Today marker consult the user's own zone.
function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

function utcKey(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

// A ride belongs on the calendar day the current user is living in, not on
// the server's UTC day; the same zone drives the "Today" marker.
function dayKey(d: Date, timeZone?: string): string {
  if (!timeZone) {
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(d);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** The user's current calendar day, encoded as a UTC-naive Date. */
function todayInZone(timeZone?: string): Date {
  if (!timeZone) {
    const now = new Date();
    return utcDate(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());

  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return utcDate(get("year"), get("month") - 1, get("day"));
}

function addDays(date: Date, amount: number): Date {
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount);
}

function startOfWeek(date: Date): Date {
  return addDays(date, -((date.getUTCDay() + 6) % 7));
}

function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

function startOfMonth(date: Date): Date {
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return utcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 0);
}

function addMonths(date: Date, amount: number): Date {
  return utcDate(date.getUTCFullYear(), date.getUTCMonth() + amount, 1);
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

/** Labels for calendar days: read as the date it says it is, never shifted. */
function calendarLabel(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(date);
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

export function CalendarView({ groups, timeZone }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [anchorDate, setAnchorDate] = useState<Date>(() => todayInZone(timeZone));

  const ridesByDate = useMemo(() => {
    const map = new Map<string, (CalendarRide & { groupLabel: string })[]>();
    groups.forEach((group) => {
      group.rides.forEach((ride) => {
        const key = dayKey(new Date(ride.scheduled_pickup_at), timeZone);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ ...ride, groupLabel: group.label });
      });
    });
    return map;
  }, [groups, timeZone]);

  const getRidesForDate = (date: Date) => ridesByDate.get(utcKey(date)) || [];

  const navigate = (direction: 1 | -1) => {
    setAnchorDate((d) => {
      if (viewMode === "day") return addDays(d, direction);
      if (viewMode === "week") return addDays(d, 7 * direction);
      return addMonths(d, direction);
    });
  };

  const goToday = () => setAnchorDate(todayInZone(timeZone));

  const rangeLabel = useMemo(() => {
    if (viewMode === "day") {
      return calendarLabel(anchorDate, {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
    }
    if (viewMode === "week") {
      const start = startOfWeek(anchorDate);
      const end = endOfWeek(anchorDate);
      const startLabel = calendarLabel(start, { month: "short", day: "numeric" });
      const endLabel = calendarLabel(end, { month: "short", day: "numeric", year: "numeric" });
      return `${startLabel} – ${endLabel}`;
    }
    return calendarLabel(anchorDate, { month: "long", year: "numeric" });
  }, [viewMode, anchorDate]);

  const days = useMemo(() => {
    if (viewMode === "day") return [anchorDate];
    if (viewMode === "week") {
      return dayRange(startOfWeek(anchorDate), endOfWeek(anchorDate));
    }
    return dayRange(startOfWeek(startOfMonth(anchorDate)), endOfWeek(endOfMonth(anchorDate)));
  }, [viewMode, anchorDate]);

  const totalRides = useMemo(() => {
    return days.reduce((sum, d) => sum + getRidesForDate(d).length, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, ridesByDate]);

  const renderDayCell = (date: Date, expanded: boolean) => {
    const rides = getRidesForDate(date);
    const isToday = utcKey(date) === dayKey(new Date(), timeZone);
    const inMonth = isSameMonth(date, anchorDate);
    const dimmed = viewMode === "month" && !inMonth;

    if (viewMode === "day") {
      return (
        <div key={utcKey(date)} className="rounded-xl border border-line bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className={`text-lg font-semibold ${isToday ? "text-brand-700" : "text-ink-900"}`}>
              {calendarLabel(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
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
                      {formatTime(ride.scheduled_pickup_at, timeZone)}
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
        key={utcKey(date)}
        className={`relative border-r border-b border-line transition-colors ${
          isToday ? "bg-brand-50 ring-2 ring-inset ring-brand-600" : "bg-card"
        } ${dimmed ? "opacity-40" : ""}`}
        style={{ minHeight: expanded ? "140px" : "110px" }}
      >
        <div className="flex items-center justify-between px-2 pt-1.5">
          <span className={`text-sm font-semibold ${isToday ? "text-brand-700" : "text-ink-900"}`}>
            {calendarLabel(date, viewMode === "week"
              ? { weekday: "short", day: "numeric" }
              : { day: "numeric" })}
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
