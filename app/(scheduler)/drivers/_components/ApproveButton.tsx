"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

// One-click approve/reject for a driver application.
export function ApproveButton({ profileId, decision }: {
  profileId: number; decision: "approved" | "rejected" | "suspended";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function review() {
    setSaving(true);
    await fetch(`/api/drivers/review/${profileId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setSaving(false);
    router.refresh();
  }

  const label = decision === "approved" ? "Approve" : decision === "rejected" ? "Reject" : "Suspend";
  return (
    <Button
      variant={decision === "approved" ? "primary" : decision === "rejected" ? "ghost" : "danger"}
      loading={saving} onClick={review}
    >
      {label}
    </Button>
  );
}
