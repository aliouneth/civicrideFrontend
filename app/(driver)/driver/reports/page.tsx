import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DriverRideReport } from "@/components/reports/DriverRideReport";
import { RequireApproved } from "../../_components/RequireApproved";

export const metadata: Metadata = { title: "Reports" };

async function DriverReportsPageContent() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="mt-1 text-sm text-ink-500">
        Your monthly rides — count, completed/cancelled, fares, and distance.
      </p>
      <div className="mt-4"><DriverRideReport mode="self" /></div>
    </div>
  );
}

export default function DriverReportsPage() {
  return (
    <RequireApproved>
      <DriverReportsPageContent />
    </RequireApproved>
  );
}