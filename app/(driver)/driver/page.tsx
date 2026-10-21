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

// Rides the driver still has to work. Terminal rides (completed/cancelled)
// belong to the history view, not to the job list.
const OPEN_STATUSES = ["assigned", "en_route", "picked_up"];
const IN_PROGRESS_STATUSES = ["en_route", "picked_up"];

// Driver home: today's job list, then claimable jobs (when agency allows).
async function DriverDashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ available?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { available } = await searchParams;

  const [today, later, open, tenant] = await Promise.all([
    apiFetch<CursorPage<Ride>>("/drivers/me/rides?scope=today", session).catch(() => null),
    apiFetch<CursorPage<Ride>>("/drivers/me/rides?scope=later", session).catch(() => null),
    apiFetch<CursorPage<Ride>>("/rides?status=pending&scope=upcoming", session).catch(() => null),
    apiFetch<{ settings?: { allow_driver_self_assignment?: boolean; timezone?: string } }>(
      "/tenant",
      session,
    ).catch(() => null),
  ]);

  const selfAssignOn = tenant?.settings?.allow_driver_self_assignment === true;
  const timeZone = tenant?.settings?.timezone ?? "UTC";

  const openRides = (page: CursorPage<Ride> | null): Ride[] =>
    (page?.data ?? []).filter((ride) => OPEN_STATUSES.includes(ride.status.code));

  const todayRides = openRides(today);
  const laterRides = openRides(later);

  // The ride under way owns the "Now" slot; the rest of today is listed below it.
  const nowRide = todayRides.find((ride) => IN_PROGRESS_STATUSES.includes(ride.status.code));
  const todayList = nowRide ? todayRides.filter((ride) => ride.id !== nowRide.id) : todayRides;
  const hasWork = Boolean(nowRide) || todayList.length > 0 || laterRides.length > 0;

  return (
    <div>
      {!hasWork ? (
        <div className="mt-4">
          <EmptyState
            title="No rides scheduled"
            body="Nothing is on your schedule today. Check the available rides below, or wait for dispatch to assign you one."
          />
        </div>
      ) : (
        <>
          {nowRide && (
            <section className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Now</h2>
              <div className="mt-2">
                <RideCard ride={nowRide} href={`/driver/rides/${nowRide.id}`} timeZone={timeZone} hideActions />
              </div>
            </section>
          )}

          {todayList.length > 0 && (
            <section className="mt-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Today</h2>
              <div className="mt-2 space-y-3">
                {todayList.map((ride) => (
                  <RideCard key={ride.id} ride={ride} href={`/driver/rides/${ride.id}`} timeZone={timeZone} hideActions />
                ))}
              </div>
            </section>
          )}

          {laterRides.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Upcoming</h2>
              <div className="mt-2 space-y-3">
                {laterRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} href={`/driver/rides/${ride.id}`} timeZone={timeZone} hideActions />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {open && (
        <AvailableRidesPanel count={open.data.length} openByDefault={available === "1"}>
          {open.data.map((ride) => (
            <Card key={ride.id}>
              <RideCard ride={ride} href={`/driver/rides/${ride.id}`} timeZone={timeZone} hideActions />
              <div className="mt-3">
                {selfAssignOn ? (
                  <ClaimButton rideId={ride.id} />
                ) : (
                  <p className="text-sm text-ink-500 text-center py-2">
                    Self-assignment is disabled by your agency.
                  </p>
                )}
              </div>
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
