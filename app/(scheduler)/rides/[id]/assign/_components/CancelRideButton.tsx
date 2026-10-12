"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

// Destructive action guard: explicit confirm step, never an instant state flip.
export function CancelRideButton({ rideId }: { rideId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function cancel() {
    setSaving(true);
    await fetch(`/api/rides/${rideId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_code: "cancelled", reason: "Cancelled by dispatcher" }),
    });
    setSaving(false);
    setOpen(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>Cancel ride…</Button>
      {open && (
        <Modal
          title="Cancel this ride?"
          body="The passenger and driver will be notified. This cannot be undone."
          confirmLabel="Yes, cancel ride"
          confirming={saving}
          onConfirm={cancel}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
