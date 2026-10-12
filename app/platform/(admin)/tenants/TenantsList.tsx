"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Logo } from "@/components/ui/Logo";
import { Modal } from "@/components/ui/Modal";

export function TenantsList() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<any | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/platform/tenants?per_page=25", {
          credentials: "include",
        });
        const result = await res.json();
        if (!res.ok) {
          setError(result.message ?? "Failed to load agencies.");
          setLoading(false);
          return;
        }
        setData(result.data ?? []);
        setLoading(false);
      } catch (e) {
        setError((e as Error).message);
        setLoading(false);
      }
    })();
  }, []);

  async function toggleActive(tenant: any) {
    setToggling(true);
    try {
      const res = await fetch(`/api/platform/tenants/${tenant.id}/active`, {
        method: "PATCH",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.message ?? "Could not update agency status.");
        return;
      }
      setData((prev) => prev?.map((t) => (t.id === tenant.id ? { ...t, is_active: !t.is_active } : t)) ?? prev);
      setConfirm(null);
    } catch {
      setError("Network error — could not update agency status.");
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="text-center">
          <div className="flex justify-center">
            <Logo height={48} priority />
          </div>
          <Suspense fallback={<div className="h-11" />}>
            <div className="animate-pulse" />
          </Suspense>
          <p className="mt-4 text-sm text-ink-500">Loading agencies…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh p-4 lg:p-6">
        <PlatformHeader />
        <div className="mt-6">
          <EmptyState title="Failed to load agencies" body={error} />
        </div>
        <Button variant="primary" onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh p-4 lg:p-6">
      <PlatformHeader />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Agencies</h1>
        <Link href="/platform/tenants/new"><Button variant="accent">New agency</Button></Link>
      </div>

      {data && data.length > 0 ? (
        <div className="mt-4 space-y-2">
          {data.map((tenant: any) => (
            <div key={tenant.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-2">              <span className="font-semibold">{tenant.name}</span>
              <span className="text-sm text-ink-500">{tenant.slug}</span>
              <span className="text-sm text-ink-500">{tenant.contact_email}</span>
              <span className="text-sm text-ink-500">{tenant.phone || "-"}</span>
              <span className={`text-sm font-medium ${tenant.is_active ? "text-brand-700" : "text-bad-fg"}`}>
                {tenant.is_active ? "Active" : "Inactive"}
              </span>
              <span className="ml-auto flex gap-3 text-sm">
                <Link href={`/platform/tenants/${tenant.id}/edit`} className="font-semibold text-brand-700 hover:underline">Edit</Link>
                <button onClick={() => setConfirm(tenant)} className="font-semibold text-bad-fg hover:underline">
                  {tenant.is_active ? "Deactivate" : "Reactivate"}
                </button>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="No agencies found"
            body="Use New agency to onboard one."
          />
        </div>
      )}

      {confirm && (
        <Modal
          title={confirm.is_active ? `Deactivate "${confirm.name}"?` : `Reactivate "${confirm.name}"?`}
          body={confirm.is_active
            ? "This agency's users can no longer log in. Any drivers are left as-is."
            : "This agency's users will be able to log in again."}
          confirmLabel={confirm.is_active ? "Deactivate" : "Reactivate"}
          cancelLabel={confirm.is_active ? "Keep active" : "Keep inactive"}
          onConfirm={() => toggleActive(confirm)}
          onClose={() => setConfirm(null)}
          confirming={toggling}
        />
      )}
    </div>
  );
}

function PlatformHeader() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Logo variant="mark" height={36} priority />
        <span className="text-lg font-bold tracking-tight">CivicRide</span>
      </div>
      <p className="mt-2 text-sm text-ink-500">Platform administration</p>
    </div>
  );
}
