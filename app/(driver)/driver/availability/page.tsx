import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { AvailabilityForm } from "./_components/AvailabilityForm";
import { RequireApproved } from "../../_components/RequireApproved";

export const metadata: Metadata = { title: "My shifts" };

async function AvailabilityPageContent() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await apiFetch<{ driver_profile: { availability: { weekday: number; start_time: string; end_time: string }[] } }>(
    "/auth/me", session,
  ).catch(() => null);

  // /auth/me includes driver_profile.availability; fall back to an empty grid.
  const initial = profile?.driver_profile?.availability?.map((w) => ({
    weekday: w.weekday, start_time: w.start_time.slice(0, 5), end_time: w.end_time.slice(0, 5),
  })) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold">My shifts</h1>
      <p className="mt-1 text-sm text-ink-500">Dispatch only offers you rides inside these windows.</p>
      <div className="mt-4"><AvailabilityForm initial={initial} /></div>
    </div>
  );
}

export default async function AvailabilityPage() {
  return (
    <RequireApproved>
      <AvailabilityPageContent />
    </RequireApproved>
  );
}
