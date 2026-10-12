"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface Props {
  rideId: number;
  statusCode: string;
  passengerName: string;
}

/** Mirrors the server guards in UpdateRideRequest / RideTransitionService. */
const EDITABLE = ["pending", "assigned"];
const CANCELLABLE = ["pending", "assigned", "en_route"];

export function RideCardActions({ rideId, statusCode, passengerName }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = EDITABLE.includes(statusCode);
  const canCancel = CANCELLABLE.includes(statusCode);

  async function cancel() {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/rides/${rideId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_code: "cancelled", reason: "Cancelled by dispatcher" }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? "Could not cancel the ride.");
      setSaving(false);

      return;
    }

    setConfirming(false);
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {canEdit && (
          <Link href={`/rides/${rideId}/edit`}>
            <Button variant="ghost" className="border-brand-300 bg-brand-50 text-brand-800 hover:bg-brand-100">
              Edit
            </Button>
          </Link>
        )}

        <Link href={`/rides/new?clone=${rideId}`}>
          <Button variant="ghost">Clone</Button>
        </Link>

        {canCancel && (
          <Button variant="dangerOutline" onClick={() => setConfirming(true)}>Cancel</Button>
        )}
      </div>

      {!canEdit && !canCancel && (
        <p className="text-xs text-ink-500">
          This ride is {statusCode.replace("_", " ")} — its details are locked.
        </p>
      )}

      {error && <p role="alert" className="mt-2 text-xs font-medium text-bad-fg">{error}</p>}

      {confirming && (
        <Modal
          title={`Cancel ${passengerName}'s ride?`}
          body="The ride will be marked cancelled and cannot be undone. The passenger and driver are not notified automatically."
          confirmLabel="Yes, cancel ride"
          confirming={saving}
          onConfirm={cancel}
          onClose={() => setConfirming(false)}
        />
      )}
    </div>
  );
}