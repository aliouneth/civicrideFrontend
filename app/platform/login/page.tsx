"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthFooterLink, AuthShell } from "../../(auth)/_components/AuthLayout";

export default function PlatformAdminLoginPage() {
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(form: FormData) {
    setSaving(true);
    setFormError(null);
    const email = (form.get("email") as string).trim();
    const payload = Object.fromEntries(form.entries());

    try {
      // Same-origin BFF proxy — avoids CORS entirely.
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "X-Tenant": "" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        setFormError(body.message ?? "Authentication failed.");
        return;
      }
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: body.token, tenant: "" }),
      });
      window.location.href = "/platform/dashboard";
    } catch {
      setFormError("Network error — check your connection and retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell
      subtitle="Log in to the platform administration area."
      footer={<AuthFooterLink prefix="Back to" href="/" linkLabel="home" />}
    >
      <form action={submit} className="space-y-4" noValidate>
        <Input name="email" type="email" label="Work email"
          autoComplete="email" required />
        <Input name="password" type="password" label="Password"
          autoComplete="current-password" required />
        {formError && <p role="alert" className="text-sm font-medium text-bad-fg">{formError}</p>}
        <Button type="submit" loading={saving} className="w-full">
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}
