import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Platform Admin — Dashboard" } satisfies Metadata;

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  const tenants = session
    ? await apiFetch<{ data: any[] }>("/platform/tenants?per_page=100", session).catch(() => null)
    : null;

  const list = tenants?.data ?? [];
  const active = list.filter((t) => t.is_active).length;
  const inactive = list.length - active;

  // All agencies combined (platform context has no tenant bound).
  const metrics = session
    ? await apiFetch<{ total_rides: number }>("/platform/metrics", session).catch(() => ({ total_rides: 0 }))
    : { total_rides: 0 };

  const totalRides = metrics.total_rides ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">Agency Dashboard</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-ink-500">Agencies</p><p className="text-3xl font-bold">{list.length}</p></Card>
        <Card><p className="text-sm text-ink-500">Active</p><p className="text-3xl font-bold">{active}</p></Card>
        <Card><p className="text-sm text-ink-500">Inactive</p><p className="text-3xl font-bold">{inactive}</p></Card>
      </div>

      <div className="mt-6">
        <Card><p className="text-sm text-ink-500">Total Platform Rides</p><p className="text-3xl font-bold">{totalRides}</p></Card>
      </div>
    </div>
  );
}