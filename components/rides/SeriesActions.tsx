"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface Props {
  seriesKey: string;
  label: string;
  openCount: number;
  occurrences: number;
}

/**
 * Bulk actions for one recurring series. Every action hits the series endpoints,
 * which replay the normal ride lifecycle per occurrence, then refreshes so the
 * counts on screen come back from the server rather than local guesswork.
 */
export function SeriesActions({ seriesKey, label, openCount, occurrences }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "cancel" | "shift">(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [days, setDays] = useState("1");
  const [showShift, setShowShift] = useState(false);

  async function call(path: string, payload: object) {
    setError(null);
    setResult(null);
    const res = await fetch(`/api/ride-series/${seriesKey}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.message ?? "That action failed.");
      return false;
    }
    setBusy(null);
    setShowShift(false);
    setResult(describe(path, body));
    router.refresh();
    return true;
  }

  function describe(path: string, body: Record<string, unknown>) {
    if (path === "cancel") {
      const skipped = Number(body.skipped ?? 0);
      return `${body.cancelled} cancelled${skipped ? `, ${skipped} already finished` : ""}.`;
    }
    const skipped = Number(body.skipped ?? 0);
    const sign = Number(body.days) > 0 ? "later" : "earlier";
    return `${body.shifted} moved ${Math.abs(Number(body.days))} day(s) ${sign}${skipped ? `, ${skipped} left in place` : ""}.`;
  }

  if (openCount === 0) {
    return <p className="text-sm text-ink-500">No open occurrences left in {occurrences} ride(s).</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => setShowShift((v) => !v)}
          className="border-brand-300 bg-brand-50 text-brand-800 hover:bg-brand-100">
          Shift schedule
        </Button>
        <Button variant="danger" onClick={() => setBusy("cancel")}>Cancel series</Button>
      </div>

      {showShift && (
        <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-paper p-3">
          <Input name="days" type="number" min={-365} max={365} label="Move by (days)"
            value={days} onChange={(e) => setDays(e.target.value)}
            hint="Negative moves earlier." className="w-40" />
          <Button loading={busy === "shift"} onClick={() => call("shift", { days: Number(days) })}>
            Apply
          </Button>
        </div>
      )}

      {result && <p role="status" className="mt-3 text-sm font-medium text-ok-fg">{result}</p>}
      {error && <p role="alert" className="mt-3 text-sm font-medium text-bad-fg">{error}</p>}

      {busy === "cancel" && (
        <Modal
          title={`Cancel "${label}"?`}
          body={`This cancels ${openCount} open ride(s) in this series. Completed and already-cancelled rides are left alone. Drivers are not notified automatically.`}
          confirmLabel="Cancel the series"
          onConfirm={() => call("cancel", { reason: "Cancelled with the rest of the series." })}
          onClose={() => setBusy(null)}
          confirming={busy === "cancel"}
        />
      )}
    </div>
  );
}