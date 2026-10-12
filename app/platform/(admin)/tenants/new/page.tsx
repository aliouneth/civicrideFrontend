"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthFooterLink, AuthShell } from "../../../../(auth)/_components/AuthLayout";

export default function NewTenantPage() {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function submit(form: FormData) {
    setSaving(true);
    setFormError(null);
    setFieldErrors({});

    const payload = {
      name: (form.get("name") as string).trim(),
      slug: (form.get("slug") as string).trim(),
      contact_email: (form.get("contact_email") as string).trim(),
      phone: (form.get("phone") as string).trim() || null,
      mileage_rate_cents: form.get("mileage_rate_cents") ? Math.round(Number(form.get("mileage_rate_cents")) * 100) : null,
      timezone: form.get("timezone") || "UTC",
      currency: form.get("currency") || "USD",
      supervisor: {
        name: (form.get("supervisor_name") as string).trim(),
        email: (form.get("supervisor_email") as string).trim(),
        password: form.get("supervisor_password"),
        password_confirmation: form.get("supervisor_password_confirmation"),
      },
    };

    try {
      const res = await fetch("/api/platform/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        if (body.errors) {
          setFieldErrors(body.errors);
        } else {
          setFormError(body.message ?? "Failed to create agency.");
        }
        return;
      }
      window.location.href = "/platform/dashboard";
    } catch {
      setFormError("Network error — check your connection and retry.");
    } finally {
      setSaving(false);
    }
  }

  const err = (name: string) => fieldErrors[name]?.[0];

  return (
    <AuthShell
      subtitle="Create a new agency."
      footer={<AuthFooterLink prefix="Back to" href="/platform/dashboard" linkLabel="dashboard" />}
    >
      <form action={submit} className="space-y-4" noValidate>
        <Input name="name" label="Agency name" error={err("name")} required />
        <Input name="slug" label="Slug" hint="Used in the subdomain, e.g. acme." error={err("slug")} required />
        <Input name="contact_email" type="email" label="Contact email" error={err("contact_email")} required />
        <Input name="phone" label="Phone" />
        <Input name="mileage_rate_cents" label="Mileage rate ($/mile)" type="number" step="0.01" min="0" error={err("mileage_rate_cents")} />
        <Input name="supervisor_name" label="Supervisor name" error={err("supervisor.name")} required />
        <Input name="supervisor_email" type="email" label="Supervisor email" error={err("supervisor.email")} required />
        <Input name="supervisor_password" type="password" label="Supervisor password" hint="Minimum 10 characters." error={err("supervisor.password")} required />
        <Input name="supervisor_password_confirmation" type="password" label="Confirm password" required />
        {formError && <p role="alert" className="text-sm font-medium text-bad-fg">{formError}</p>}
        <Button type="submit" loading={saving} className="w-full">
          Create agency
        </Button>
      </form>
    </AuthShell>
  );
}
