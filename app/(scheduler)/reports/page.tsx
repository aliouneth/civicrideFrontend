import type { Metadata } from "next";
import { ReportsPanel } from "./_components/ReportsPanel";
import { DriverRideReport } from "@/components/reports/DriverRideReport";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="mt-1 text-sm text-ink-500">Daily/weekly/monthly logs, driver performance, tenant metrics.</p>
      <div className="mt-4"><ReportsPanel /></div>

      <h2 className="mt-8 text-lg font-semibold">Driver monthly rides</h2>
      <p className="mt-1 text-sm text-ink-500">
        Pick a driver and month to see every ride they ran, with totals.
      </p>
      <div className="mt-3"><DriverRideReport mode="any" /></div>
    </div>
  );
}
