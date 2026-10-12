"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface Metrics {
  by_status: Record<string, number>;
  per_driver: { driver_profile_id: number; assigned: number; completed: number; avg_pickup_delay_min: number | null }[];
}

// Client island: date range → metrics table + async export with polling.
export function ReportsPanel() {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportState, setExportState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/metrics?from=${from}&to=${to}`);
      if (!res.ok) throw new Error("Could not load metrics.");
      setMetrics(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  async function requestExport(format: "csv" | "json") {
    setExporting(true);
    setExportState("Queued…");
    try {
      const res = await fetch("/api/reports/exports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rides.range", format, from, to }),
      });
      const created = await res.json();
      // Poll until the queued job finishes (simple, robust pre-WebSocket).
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const status = await (await fetch(`/api/reports/exports/${created.id}`)).json();
        if (status.status === "ready") {
          setExportState(`Ready: ${status.file_path}`);
          return;
        }
        if (status.status === "failed") {
          setExportState(`Failed: ${status.error ?? "unknown error"}`);
          return;
        }
      }
      setExportState("Still processing — check back shortly.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button loading={loading} onClick={load}>Load metrics</Button>
          <Button variant="ghost" loading={exporting} onClick={() => requestExport("csv")}>Export CSV</Button>
          <Button variant="ghost" loading={exporting} onClick={() => requestExport("json")}>Export JSON</Button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-bad-fg">{error}</p>}
        {exportState && <p className="mt-2 text-sm text-ink-500">{exportState}</p>}
      </Card>

      {metrics && (
        <>
          <h2 className="mt-6 text-lg font-semibold">Rides by status</h2>
          <Card className="mt-2">
            <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-sm font-semibold text-ink-500">Total rides</dt>
                <dd className="tnum">
                  {Object.values(metrics.by_status).reduce((sum, total) => sum + Number(total), 0)}
                </dd>
              </div>
              {Object.entries(metrics.by_status).map(([code, total]) => (
                <div key={code} className="flex justify-between border-b border-line py-1">
                  <dt className="font-semibold capitalize">{code.replace("_", " ")}</dt>
                  <dd className="tnum">{total}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <h2 className="mt-6 text-lg font-semibold">Driver performance</h2>
          <Card className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink-500">
                  <th scope="col" className="py-2 pr-4">Driver</th>
                  <th scope="col" className="py-2 pr-4">Assigned</th>
                  <th scope="col" className="py-2 pr-4">Completed</th>
                  <th scope="col" className="py-2">Avg pickup delay</th>
                </tr>
              </thead>
              <tbody>
                {metrics.per_driver.map((row) => (
                  <tr key={row.driver_profile_id} className="border-b border-line last:border-0">
                    <td className="py-2 pr-4 font-semibold">#{row.driver_profile_id}</td>
                    <td className="tnum py-2 pr-4">{row.assigned}</td>
                    <td className="tnum py-2 pr-4">{row.completed}</td>
                    <td className="tnum py-2">
                      {row.avg_pickup_delay_min === null ? "—" : `${Math.round(row.avg_pickup_delay_min)} min`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}