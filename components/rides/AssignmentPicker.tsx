"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

// Client leaf: posts the assignment, surfaces double-booking errors inline.
export function AssignmentPicker({ rideId, drivers }: {
  rideId: number;
  drivers: { id: number; name: string; activeCount: number }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function assign() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/rides/${rideId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver_profile_id: Number(selected) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.errors?.driver?.[0] ?? body?.message ?? "Assignment failed.");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assignment failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label htmlFor="driver" className="mb-1 block text-sm font-semibold">Driver</label>
      <select
        id="driver"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        aria-describedby={error ? "assign-error" : undefined}
        className="min-h-[44px] w-full rounded-lg border border-line bg-card px-3 py-2 text-base"
      >
        <option value="">Select a driver…</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} · {d.activeCount} active ride{d.activeCount === 1 ? "" : "s"}
          </option>
        ))}
      </select>
      {error && <p id="assign-error" role="alert" className="mt-1 text-sm font-medium text-bad-fg">{error}</p>}
      <Button className="mt-4 w-full" disabled={!selected} loading={saving} onClick={assign}>
        Assign ride
      </Button>
    </div>
  );
}
