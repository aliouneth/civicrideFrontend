import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiFetch, type CursorPage, type Ride } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CompletedRidesTable } from "./_components/CompletedRidesTable";

export const metadata: Metadata = { title: "Completed rides" };

const MONTH_RE = /^\d{4}-\d{2}$/;

// Current month as "YYYY-MM" (UTC: near month boundaries the driver's webzone
// may still be the previous month, but the picker lets them choose any month).
function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(`${key}-01T00:00:00Z`));
}

// Driver history: completed rides for a chosen month, listed in a table.
export default async function DriverHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; cursor?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { month, cursor } = await searchParams;
  const selected = month && MONTH_RE.test(month) ? month : currentMonthKey();
  const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";

  const history = await apiFetch<CursorPage<Ride>>(
    `/drivers/me/rides?status=completed&month=${selected}${cursorParam}`,
    session,
  ).catch(() => null);

  return (
    <div>
      <h1 className="text-2xl font-bold">Completed rides</h1>
      <p className="mt-1 text-sm text-ink-500">{monthLabel(selected)}</p>

      <form method="get" action="/driver/history" className="mt-4 flex items-end gap-2">
        <Input
          type="month"
          name="month"
          label="Month"
          defaultValue={selected}
          className="flex-1"
        />
        <Button>Show</Button>
      </form>

      <CompletedRidesTable rides={history?.data ?? []} />

      {history?.next_cursor && (
        <a
          href={`/driver/history?month=${selected}&cursor=${encodeURIComponent(history.next_cursor)}`}
          className="mt-4 flex min-h-[44px] items-center justify-center rounded-xl border border-line bg-card font-semibold transition-colors hover:bg-ink-50"
        >
          Show more
        </a>
      )}
    </div>
  );
}