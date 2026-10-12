"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

// Self-assignment from the jobs list. Enabled only when the agency allows it
// (the page hides this button otherwise); the API enforces it regardless.
export function ClaimButton({ rideId }: { rideId: number }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/rides/${rideId}/self-assign`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.errors?.driver?.[0] ?? body?.message ?? "Could not claim this ride.");
      }
      router.push(`/driver/rides/${rideId}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not claim this ride.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Button variant="accent" loading={saving} onClick={claim} className="w-full">
        Claim this ride
      </Button>
      {error && <p role="alert" className="mt-1 text-sm font-medium text-bad-fg">{error}</p>}
    </div>
  );
}
