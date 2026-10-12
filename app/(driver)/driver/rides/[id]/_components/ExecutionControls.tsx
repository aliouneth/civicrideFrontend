"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { nextDriverActions } from "@/lib/ride-status";

// Driver execution leaf: exactly one primary action per state (Start →
// Pickup → Drop-off), big touch targets, optional note/incident attached.
// `canStart` is false when the ride is scheduled for another day — the backend
// refuses that transition too, this just makes it visible up front.
export function ExecutionControls({
  rideId,
  statusCode,
  canStart = true,
}: {
  rideId: number;
  statusCode: string;
  canStart?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [incident, setIncident] = useState("");
  const [error, setError] = useState<string | null>(null);

  const actions = nextDriverActions(statusCode);
  if (actions.length === 0) return null;

  async function advance(to: string) {
    setSaving(to);
    setError(null);
    try {
      const res = await fetch(`/api/rides/${rideId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_code: to,
          note: note || undefined,
          incident: incident || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.errors?.to_code?.[0] ?? body?.message ?? "Update failed.");
      }
      setNote("");
      setIncident("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <details className="rounded-lg border border-line bg-card p-3">
        <summary className="min-h-[44px] cursor-pointer text-sm font-semibold">
          Add a note or incident (optional)
        </summary>
        <div className="mt-2 space-y-3">
          <Textarea label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Gate B, passenger called…" />
          <Textarea label="Incident" value={incident} onChange={(e) => setIncident(e.target.value)} placeholder="Flat tire, delay 15 min…" />
        </div>
      </details>
      {actions.map((a) => (
        <Button
          key={a.to}
          loading={saving === a.to}
          onClick={() => advance(a.to)}
          className="w-full text-lg"
        >
          {a.label}
        </Button>
      ))}
      {error && <p role="alert" className="text-sm font-medium text-bad-fg">{error}</p>}
    </div>
  );
}
