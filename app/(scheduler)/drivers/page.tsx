import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DriversGrid } from "./_components/DriversGrid";
import type { DriverListItem } from "./_components/types";

export const metadata = { title: "Drivers" } satisfies Metadata;

export const dynamic = "force-dynamic";

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const session = await getSession();

  let drivers: DriverListItem[] = [];
  let error: string | null = null;
  if (session) {
    try {
      const res = await apiFetch<{ data: DriverListItem[] }>(
        `/drivers${q ? `?q=${encodeURIComponent(q)}` : ""}`,
        session
      );
      drivers = res.data ?? [];
    } catch (e) {
      error = e instanceof Error ? e.message : "Could not load drivers.";
    }
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-700">Agency</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Drivers</h1>
          <p className="mt-1 text-sm text-ink-500">
            {drivers.length} {drivers.length === 1 ? "driver" : "drivers"}
          </p>
        </div>
        <form action="/drivers" method="get" className="flex w-full max-w-md items-end gap-2">
          <Input
            label="Search drivers"
            name="q"
            defaultValue={q}
            placeholder="Search by name…"
            className="flex-1"
          />
          <Button type="submit" variant="ghost">
            Search
          </Button>
          {q && (
            <Link
              href="/drivers"
              className="inline-flex h-[44px] items-center justify-center rounded-lg px-2 text-sm font-semibold text-brand-700 hover:underline"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-line bg-bad-bg px-4 py-3 text-sm font-medium text-bad-fg">
          {error}
        </p>
      )}

      <DriversGrid drivers={drivers} />
    </div>
  );
}