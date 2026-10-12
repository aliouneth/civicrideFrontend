"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { User } from "@/lib/api";

const ROLE_LABELS: Record<string, string> = {
  supervisor: "Supervisor",
  admin: "Admin",
  scheduler: "Dispatcher",
  driver: "Driver",
};

export function AgencyUsersList({ users, currentUserId }: { users: User[]; currentUserId: number }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(user: User) {
    setBusyId(user.id);
    setError(null);
    try {
      const res = await fetch(`/api/users/${user.id}/active`, { method: "PATCH" });
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

  if (users.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-line bg-card px-4 py-6 text-center text-sm text-ink-500">
        No users yet. Invite a dispatcher below.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {users.map((u) => {
        const isSelf = u.id === currentUserId;
        return (
          <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{u.name}</span>
                <span className="rounded-full bg-ink-50 px-2 py-0.5 text-xs font-semibold text-ink-600">
                  {ROLE_LABELS[u.role?.name ?? ""] ?? u.role?.name ?? "—"}
                </span>
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
              disabled={isSelf}
              title={isSelf ? "You cannot disable your own account." : undefined}
              onClick={() => toggle(u)}
            >
              {u.is_active ? "Disable" : "Enable"}
            </Button>
          </Card>
        );
      })}
      {error && <p role="alert" className="text-sm font-medium text-bad-fg">{error}</p>}
    </div>
  );
}