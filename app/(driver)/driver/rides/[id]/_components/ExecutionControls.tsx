"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { nextDriverActions, previousDriverAction } from "@/lib/ride-status";
import { apiFetch } from "@/lib/api";

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
  const [mileageClaimed, setMileageClaimed] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Cancellation dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasons, setCancelReasons] = useState<Array<{ value: string; label: string }>>([]);

  // Fetch cancellation reasons on mount
  useEffect(() => {
    async function loadReasons() {
      try {
        const res = await fetch("/api/cancellation-reasons", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          // Filter to active reasons only, map to value/label for Select
          setCancelReasons(
            (data.data ?? data)
              .filter((r: any) => r.is_active)
              .map((r: any) => ({ value: r.code, label: r.label }))
          );
        }
      } catch {
        // Silently fail — cancel button will still work, just without predefined reasons
      }
    }
    loadReasons();
  }, []);

  const actions = nextDriverActions(statusCode).filter(
    (a) => a.to !== "en_route" || canStart,
  );
  const backAction = previousDriverAction(statusCode);
  const showCancelButton = ["assigned", "en_route", "at_pickup", "transporting"].includes(statusCode);

  async function getLocation(): Promise<{ lat?: number; lng?: number }> {
    if (typeof navigator === "undefined" || !navigator.geolocation) return {};
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({}),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
      );
    });
  }

  async function advance(to: string, extra?: { reason?: string }) {
    if (to === "completed" && !mileageClaimed) {
      setError("Mileage claimed is required.");
      return;
    }
    setSaving(to);
    setError(null);
    try {
      const coords = await getLocation();
      const res = await fetch(`/api/rides/${rideId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           to_code: to,
           note: note || undefined,
           incident: incident || undefined,
           reason: extra?.reason,
           lat: coords.lat,
           lng: coords.lng,
           mileage_claimed: to === "completed" && mileageClaimed ? Number(mileageClaimed) : undefined,
         }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.errors?.to_code?.[0] ?? body?.message ?? "Update failed.");
      }
      setNote("");
      setIncident("");
      setShowCancelDialog(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setSaving(null);
    }
  }

  async function saveNotes() {
    if (!note && !incident) {
      setError("Enter a note or incident to save.");
      return;
    }
    setSaving("save-notes");
    setError(null);
    try {
      const res = await fetch(`/api/drivers/me/rides/${rideId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, incident }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? "Save failed.");
      }
      setError(null);
      // Show brief success feedback
      setNote("");
      setIncident("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(null);
    }
  }

  function handleCancelConfirm() {
    if (!cancelReason) {
      setError("Please select a cancellation reason.");
      return;
    }
    advance("cancelled", { reason: cancelReason });
  }

  // Only show execution controls for non-terminal states
  const isTerminal = ["completed", "cancelled"].includes(statusCode);
  if (isTerminal && !showCancelButton) return null;

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
        <div className="mt-2">
          <Button
            variant="accent"
            loading={saving === "save-notes"}
            onClick={saveNotes}
            className="w-full bg-ok-600 hover:bg-ok-700"
          >
            Save note
          </Button>
        </div>
      </details>

      {actions.some((a) => a.to === "completed") && (
        <Input
          label="Mileage Claimed"
          type="number"
          step="any"
          min={0}
          required
          value={mileageClaimed}
          onChange={(e) => setMileageClaimed(e.target.value)}
          hint="Miles claimed for this ride."
        />
      )}

      {/* Back (left) + primary step (right) */}
      {(actions.length > 0 || backAction) && (
        <div className="flex items-center gap-2">
          {backAction && (
            <Button
              variant="ghost"
              loading={saving === backAction.to}
              onClick={() => advance(backAction.to)}
              aria-label="Back"
              className="shrink-0 min-h-0 px-2 py-1 text-base"
            >
              <span aria-hidden className="leading-none">←</span>
            </Button>
          )}
          <div className="flex-1 space-y-2">
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
          </div>
        </div>
      )}

      {/* Cancel button with confirmation dialog */}
      {showCancelButton && (
        <>
          <Button
            variant="danger"
            loading={saving === "cancelled"}
            onClick={() => setShowCancelDialog(true)}
            className="w-full text-lg border-bad-fg/25"
          >
            Cancel ride
          </Button>

          {showCancelDialog && (
            <Modal
              title="Cancel this ride?"
              body="This action cannot be undone. Please select a reason for cancellation."
              confirmLabel="Confirm cancellation"
              cancelLabel="Keep ride"
              onConfirm={handleCancelConfirm}
              onClose={() => { setShowCancelDialog(false); setCancelReason(""); }}
              confirming={saving === "cancelled"}
            >
              <Select
                label="Cancellation reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                options={cancelReasons}
                required
              />
              {cancelReasons.length === 0 && (
                <p className="mt-2 text-sm text-ink-500">
                  No predefined reasons available. You can still cancel with a custom reason.
                </p>
              )}
            </Modal>
          )}
        </>
      )}

      {error && <p role="alert" className="text-sm font-medium text-bad-fg">{error}</p>}
    </div>
  );
}