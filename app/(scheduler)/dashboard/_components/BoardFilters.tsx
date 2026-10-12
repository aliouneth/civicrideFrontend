import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const WINDOWS = [
  { value: "7", label: "Next 7 days" },
  { value: "14", label: "Next 14 days" },
  { value: "30", label: "Next 30 days" },
  { value: "60", label: "Next 60 days" },
  { value: "90", label: "Next 90 days" },
];

const PAST_WINDOWS = [
  { value: "0", label: "Today only" },
  { value: "1", label: "Yesterday" },
  { value: "3", label: "Last 3 days" },
  { value: "7", label: "Last week" },
  { value: "14", label: "Last 2 weeks" },
  { value: "30", label: "Last month" },
  { value: "90", label: "Last 3 months" },
];

// Combined time window options: { days, pastDays, label }
// "Next X days" presets are forward-only (look no further back than the user's
// selection); the past+future presets explicitly include their labeled past.
const TIME_WINDOWS = [
  { value: "next-7", label: "Next 7 days", days: 7, pastDays: 0 },
  { value: "next-14", label: "Next 14 days", days: 14, pastDays: 0 },
  { value: "next-30", label: "Next 30 days", days: 30, pastDays: 0 },
  { value: "next-60", label: "Next 60 days", days: 60, pastDays: 0 },
  { value: "next-90", label: "Next 90 days", days: 90, pastDays: 0 },
  { value: "week", label: "Past week → Next week", days: 7, pastDays: 7 },
  { value: "fortnight", label: "Past 2 weeks → Next 2 weeks", days: 14, pastDays: 14 },
  { value: "month", label: "Past month → Next month", days: 30, pastDays: 30 },
  { value: "quarter", label: "Past 3 months → Next 3 months", days: 90, pastDays: 90 },
];

export interface BoardFilterState {
  by: string;
  q: string;
  unassigned: boolean;
  seriesOnly: boolean;
  days: number;
  pastDays: number;
  includeCompleted: boolean;
  startDate: string; // "YYYY-MM-DD" or "" when not in use (exclusive with time window)
  endDate: string;
}

function decodeWindow(value: string): { days: number; pastDays: number } {
  const w = TIME_WINDOWS.find(w => w.value === value);
  return w ? { days: w.days, pastDays: w.pastDays } : { days: 14, pastDays: 0 };
}

function encodeWindow(days: number, pastDays: number): string {
  const w = TIME_WINDOWS.find(w => w.days === days && w.pastDays === pastDays);
  return w ? w.value : "next-14";
}

// Plain GET form: filtering works without JS and every state is a shareable URL.
// `by` rides along hidden so changing a filter never silently resets the grouping.
export function BoardFilters({ state }: { state: BoardFilterState }) {
  const { days, pastDays } = decodeWindow(encodeWindow(state.days, state.pastDays));
  const windowValue = encodeWindow(state.days, state.pastDays);
  const hasDateRange = state.startDate !== "" || state.endDate !== "";

  const active = state.q !== "" || state.unassigned || state.seriesOnly
    || state.days !== 14 || state.pastDays !== 0 || state.includeCompleted
    || hasDateRange;

  // "Clear date range" drops just the dates and hands control back to the time
  // window, preserving the search term, grouping, and quick filters.
  const withoutDates = new URLSearchParams();
  if (state.by) withoutDates.set("by", state.by);
  if (state.q) withoutDates.set("q", state.q);
  if (state.unassigned) withoutDates.set("unassigned", "1");
  if (state.seriesOnly) withoutDates.set("series_only", "1");
  if (state.includeCompleted) withoutDates.set("include_completed", "1");
  withoutDates.set("time_window", windowValue);

  return (
    <form method="get" action="/dashboard" role="search" className="rounded-xl border border-line bg-card p-4">
      <input type="hidden" name="by" value={state.by} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Input
            type="search"
            name="q"
            label="Search rides"
            defaultValue={state.q}
            placeholder="Name, phone, address, ride # or group"
          />

          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 text-sm font-semibold">Date range</legend>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" name="start_date" label="Start" defaultValue={state.startDate} />
              <Input type="date" name="end_date" label="End" defaultValue={state.endDate} />
            </div>
          </fieldset>
        </div>

        <div>
          <Select
            name="time_window"
            label="Time window"
            defaultValue={windowValue}
            disabled={hasDateRange}
            options={TIME_WINDOWS.map(w => ({ value: w.value, label: w.label }))}
          />
          {hasDateRange && (
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
              Disabled while a custom date range is set.
              <Link href={`/dashboard?${withoutDates.toString()}`} className="font-semibold text-brand-700 hover:underline">
                Clear date range
              </Link>
            </p>
          )}
        </div>

        <fieldset className="flex flex-col justify-center gap-1">
          <legend className="mb-1 text-sm font-semibold">Quick filters</legend>
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-semibold hover:bg-paper">
            <input type="checkbox" name="unassigned" value="1" defaultChecked={state.unassigned}
              className="h-5 w-5 accent-brand-600" />
            Needs a driver
          </label>
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-semibold hover:bg-paper">
            <input type="checkbox" name="series_only" value="1" defaultChecked={state.seriesOnly}
              className="h-5 w-5 accent-brand-600" />
            Recurring groups only
          </label>
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-semibold hover:bg-paper">
            <input type="checkbox" name="include_completed" value="1" defaultChecked={state.includeCompleted}
              className="h-5 w-5 accent-brand-600" />
            Include completed & cancelled
          </label>
        </fieldset>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-brand-600 px-5 py-2 text-base font-semibold text-white transition-colors duration-200 ease-out hover:bg-brand-700"
          >
            Search
          </button>
          {active && (
            <Link
              href={`/dashboard?by=${state.by}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-line px-4 text-base font-semibold text-ink-900 hover:bg-paper"
            >
              Clear
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}