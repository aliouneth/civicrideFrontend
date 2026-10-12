"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Window { weekday: number; start_time: string; end_time: string; }

// Weekly availability grid: one row per enabled weekday, HH:mm windows.
export function AvailabilityForm({ initial }: { initial: Window[] }) {
  const router = useRouter();
  const [windows, setWindows] = useState<Window[]>(
    initial.length > 0 ? initial : [{ weekday: 1, start_time: "08:00", end_time: "17:00" }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set(i: number, patch: Partial<Window>) {
    setWindows((w) => w.map((row, j) => (j === i ? { ...row, ...patch } : row)));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/drivers/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ windows }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Could not save availability.");
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      {windows.map((w, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto] items-end gap-2 rounded-lg border border-line bg-card p-3">
          <label className="text-sm font-semibold">
            Day
            <select
              value={w.weekday}
              onChange={(e) => set(i, { weekday: Number(e.target.value) })}
              className="mt-1 block min-h-[44px] w-full rounded-lg border border-line bg-card px-2 text-base font-normal"
            >
              {DAYS.map((d, n) => <option key={n} value={n}>{d}</option>)}
            </select>
          </label>
          <Button
            variant="ghost" aria-label={`Remove window ${i + 1}`}
            onClick={() => setWindows((ws) => ws.filter((_, j) => j !== i))}
          >✕</Button>
          <Input label="From" type="time" value={w.start_time} onChange={(e) => set(i, { start_time: e.target.value })} />
          <Input label="To" type="time" value={w.end_time} onChange={(e) => set(i, { end_time: e.target.value })} />
        </div>
      ))}
      <Button
        variant="ghost" className="w-full"
        onClick={() => setWindows((w) => [...w, { weekday: 1, start_time: "08:00", end_time: "17:00" }])}
      >
        + Add window
      </Button>
      {error && <p role="alert" className="text-sm font-medium text-bad-fg">{error}</p>}
      {saved && <p role="status" className="text-sm font-medium text-ok-fg">Availability saved.</p>}
      <Button loading={saving} onClick={save} className="w-full">Save shifts</Button>
    </div>
  );
}
