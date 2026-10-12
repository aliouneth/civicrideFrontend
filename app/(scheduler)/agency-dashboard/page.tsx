import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Agency Dashboard" } satisfies Metadata;

export const dynamic = "force-dynamic";

export default async function AgencyDashboardPage() {
  const session = await getSession();

  let ridesData: any[] = [];
  if (session) {
    const res = await apiFetch<{ groups: { rides: any[] }[] }>("/rides/board?include_completed=1", session);
    ridesData = res.groups?.flatMap((g) => g.rides ?? []) ?? [];
  }

  const totalRides = ridesData.length;
  const pendingRides = ridesData.filter((r: any) => r.status?.code === "pending").length;
  const assignedRides = ridesData.filter((r: any) => r.status?.code === "assigned").length;

  // Count drivers from rides data (unique driver_profile_ids)
  const driverCount = ridesData.length > 0 
    ? new Set(ridesData.map((r: any) => r.driver_profile_id ?? r.assigned_by ?? 0)).size 
    : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Agency Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm text-ink-500">Total rides</p>
          <p className="text-3xl font-bold">{totalRides}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Pending</p>
          <p className="text-3xl font-bold">{pendingRides}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Assigned</p>
          <p className="text-3xl font-bold">{assignedRides}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Total Drivers</p>
          <p className="text-3xl font-bold">{driverCount}</p>
        </Card>
      </div>
    </div>
  );
}