import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiFetch, type CursorPage, type Ride } from "@/lib/api";
import { RideCard } from "@/components/rides/RideCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClaimButton } from "./_components/ClaimButton";
import { AvailableRidesPanel } from "./_components/AvailableRidesPanel";
import { Card } from "@/components/ui/Card";
import { RequireApproved } from "../_components/RequireApproved";

export const metadata: Metadata = { title: "Jobs" };

// Driver home: my active ride first, then claimable jobs (when agency allows).
async function DriverDashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ available?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { available } = await searchParams;

  const [mine, open, tenant] = await Promise.all([
    apiFetch<CursorPage<Ride>>("/drivers/me/rides", session),
    apiFetch<CursorPage<Ride>>("/rides?status=pending", session).catch(() => null),
    apiFetch<{ settings?: { allow_driver_self_assignment?: boolean } }>("/tenant", session).catch(() => null),
  ]);

  const selfAssignOn = tenant?.settings?.allow_driver_self_assignment === true;
  const active = mine.data.find((r) => ["assigned", "en_route", "picked_up"].includes(r.status.code));

  return (
    <div>
      <h1 className="text-2xl font-bold">Jobs</h1>

      {active ? (
        <div className="mt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Now</h2>
          <div className="mt-2"><RideCard ride={active} href={`/driver/rides/${active.id}`} hideActions /></div>
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState title="No active ride" body="Check the available rides below, or wait for dispatch to assign you one." />
        </div>
      )}

      {selfAssignOn && open && (
        <AvailableRidesPanel count={open.data.length} openByDefault={available === "1"}>
          {open.data.map((ride) => (
            <Card key={ride.id}>
              <RideCard ride={ride} href={`/driver/rides/${ride.id}`} hideActions />
              <div className="mt-3"><ClaimButton rideId={ride.id} /></div>
            </Card>
          ))}
        </AvailableRidesPanel>
      )}

      <Link
        href="/driver/history"
        className="mt-8 flex min-h-[48px] items-center justify-between gap-2 rounded-xl border border-line bg-card px-4 py-2.5 font-semibold transition-colors hover:bg-ink-50"
      >
        <span>Completed rides</span>
        <span aria-hidden="true" className="text-ink-500">▸</span>
      </Link>
    </div>
  );
}

export default async function DriverDashboard({
  searchParams,
}: {
  searchParams: Promise<{ available?: string }>;
}) {
  return (
    <RequireApproved>
      <DriverDashboardContent searchParams={searchParams} />
    </RequireApproved>
  );
}
