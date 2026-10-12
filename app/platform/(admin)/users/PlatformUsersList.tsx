"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PlatformUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
}

// Enable/disable platform admins. The API also refuses to disable the account
// you're logged in with, so the error surfaces here rather than locking you out.
export function PlatformUsersList({ users }: { users: PlatformUser[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(user: PlatformUser) {
    setBusyId(user.id);
    setError(null);
    try {
      const res = await fetch(`/api/platform/users/${user.id}/active`, { method: "PATCH" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Could not update the user.");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update the user.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      {users.map((u) => (
        <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{u.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  u.is_active ? "bg-ok-bg text-ok-fg" : "bg-bad-bg text-bad-fg"
                }`}
              >
                {u.is_active ? "Active" : "Disabled"}
              </span>
            </div>
            <p className="truncate text-sm text-ink-500">{u.email}</p>
          </div>
          <Button
            variant={u.is_active ? "dangerOutline" : "ghost"}
            loading={busyId === u.id}
            onClick={() => toggle(u)}
          >
            {u.is_active ? "Disable" : "Enable"}
          </Button>
        </Card>
      ))}
      {error && <p role="alert" className="text-sm font-medium text-bad-fg">{error}</p>}
    </div>
  );
}