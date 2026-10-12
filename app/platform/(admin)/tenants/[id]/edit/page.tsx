"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Logo } from "@/components/ui/Logo";

export default function EditAgencyPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const usersRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showUsers) {
      usersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showUsers]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/platform/tenants/${id}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.message ?? "Failed to load agency.");
        setTenant(body);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load agency.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function submit(form: FormData) {
    setSaving(true);
    setError(null);
    setFieldErrors({});

    const supervisorName = (form.get("supervisor_name") as string).trim();
    const supervisorEmail = (form.get("supervisor_email") as string).trim();
    const supervisorPassword = form.get("supervisor_password") as string;
    const supervisorPasswordConfirmation = form.get("supervisor_password_confirmation") as string;

    const payload: Record<string, unknown> = {
      name: (form.get("name") as string).trim(),
      slug: (form.get("slug") as string).trim(),
      contact_email: (form.get("contact_email") as string).trim(),
      phone: (form.get("phone") as string).trim() || null,
      mileage_rate_cents: form.get("mileage_rate_cents") ? Math.round(Number(form.get("mileage_rate_cents")) * 100) : null,
      timezone: form.get("timezone") || undefined,
      currency: form.get("currency") || undefined,
      supervisor: {
        name: supervisorName,
        email: supervisorEmail,
        ...(supervisorPassword ? { password: supervisorPassword, password_confirmation: supervisorPasswordConfirmation } : {}),
      },
    };

    try {
      const res = await fetch(`/api/platform/tenants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        if (body.errors) setFieldErrors(body.errors);
        else setError(body.message ?? "Failed to update agency.");
        return;
      }
      window.location.href = "/platform/dashboard";
    } catch {
      setError("Network error — check your connection and retry.");
    } finally {
      setSaving(false);
    }
  }

  const err = (name: string) => fieldErrors[name]?.[0];

  // Agency head: "supervisor" is the current role name, "owner" the legacy one.
  const supervisor = tenant?.users?.find((u: any) => ["supervisor", "owner"].includes(u.role?.name));

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="text-center">
          <div className="flex justify-center"><Logo height={48} priority /></div>
          <p className="mt-4 text-sm text-ink-500">Loading agency…</p>
        </div>
      </div>
    );
  }

  if (error && !tenant) {
    return (
      <div className="p-6">
        <EmptyState title="Could not load agency" body={error} />
        <Link href="/platform/dashboard" className="mt-4 inline-block font-semibold text-brand-700 hover:underline">Back to agencies</Link>
      </div>
    );
  }

  const tenantUsers: any[] = tenant?.users ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo variant="mark" height={36} priority />
          <div>
            <h1 className="text-2xl font-bold">Edit agency</h1>
            <p className="text-sm text-ink-500">{tenant?.slug}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => setShowUsers(true)}>Tenant Users</Button>
      </div>

      <form action={submit} className="mt-6 space-y-6" noValidate>
        <div className="grid gap-x-6 gap-y-4 lg:grid-cols-3">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Agency details</h2>
            <Input name="name" label="Agency name" defaultValue={tenant?.name} error={err("name")} required />
            <Input name="slug" label="Slug" hint="Used in the subdomain, e.g. acme." defaultValue={tenant?.slug} error={err("slug")} required />
            <Input name="contact_email" type="email" label="Contact email" defaultValue={tenant?.contact_email} error={err("contact_email")} required />
            <Input name="phone" label="Phone" defaultValue={tenant?.phone ?? ""} error={err("phone")} />
            <Input name="mileage_rate_cents" label="Mileage rate ($/mile)" type="number" step="0.01" min="0" defaultValue={tenant?.mileage_rate_cents ? (tenant.mileage_rate_cents / 100).toFixed(2) : ""} error={err("mileage_rate_cents")} />
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Supervisor</h2>
            <Input name="supervisor_name" label="Supervisor name" defaultValue={supervisor?.name} error={err("supervisor.name")} required />
            <Input name="supervisor_email" type="email" label="Supervisor email" defaultValue={supervisor?.email} error={err("supervisor.email")} required />
            <Input name="supervisor_password" type="password" label="Supervisor password" hint="Leave blank to keep the current one (min. 10 chars if changing)." error={err("supervisor.password")} />
            <Input name="supervisor_password_confirmation" type="password" label="Confirm password" />
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Settings</h2>
            <Select
              name="timezone"
              label="Timezone"
              defaultValue={tenant?.settings?.timezone ?? "UTC"}
              options={TIMEZONES}
            />
            <Select
              name="currency"
              label="Currency"
              defaultValue={tenant?.settings?.currency ?? "USD"}
              options={CURRENCIES}
            />
          </section>
        </div>

        {error && <p role="alert" className="text-sm font-medium text-bad-fg">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" loading={saving} className="flex-1">Save changes</Button>
          <Link href="/platform/dashboard" className="flex-1 inline-flex min-h-[44px] items-center justify-center rounded-lg border border-line bg-card px-4 py-2 text-base font-semibold hover:bg-paper">Cancel</Link>
        </div>
      </form>

      {showUsers && (
        <section ref={usersRef} className="mt-10 scroll-mt-6">
          <h2 className="text-lg font-bold">Tenant Users</h2>
          {tenantUsers.length > 0 ? (
            <div className="mt-4 space-y-2">
              {tenantUsers.map((u: any) => (
                <div key={u.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-2">
                  <span className="font-semibold">{u.name}</span>
                  <span className="text-sm text-ink-500">{u.email}</span>
                  {u.role?.name && <span className="text-sm text-ink-500">{u.role.name}</span>}
                  <span className={`ml-auto text-sm font-medium ${u.is_active ? "text-brand-700" : "text-bad-fg"}`}>
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="No users found" body="This agency has no users yet." />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern (America/New_York)" },
  { value: "America/Chicago", label: "Central (America/Chicago)" },
  { value: "America/Denver", label: "Mountain (America/Denver)" },
  { value: "America/Phoenix", label: "Mountain no-DST (America/Phoenix)" },
  { value: "America/Los_Angeles", label: "Pacific (America/Los_Angeles)" },
  { value: "America/Anchorage", label: "Alaska (America/Anchorage)" },
  { value: "Pacific/Honolulu", label: "Hawaii (Pacific/Honolulu)" },
  { value: "America/Toronto", label: "Eastern Canada (America/Toronto)" },
  { value: "America/Vancouver", label: "Pacific Canada (America/Vancouver)" },
  { value: "Europe/London", label: "United Kingdom (Europe/London)" },
  { value: "Europe/Paris", label: "Central Europe (Europe/Paris)" },
  { value: "Europe/Berlin", label: "Germany (Europe/Berlin)" },
  { value: "Australia/Sydney", label: "Eastern Australia (Australia/Sydney)" },
];

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "CHF", label: "CHF — Swiss Franc" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "MXN", label: "MXN — Mexican Peso" },
];
