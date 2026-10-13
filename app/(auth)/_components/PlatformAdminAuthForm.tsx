"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function PlatformAdminAuthForm({ mode }: { mode: "login" }) {
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(form: FormData) {
    setSaving(true);
    setFieldErrors({});
    setFormError(null);

    const email = (form.get("email") as string).trim();
    const payload = Object.fromEntries(form.entries());

    try {
      // Same-origin BFF proxy — avoids CORS entirely.
      const res = await fetch(`/api/auth/${mode}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = await res.json();
      if (!res.ok) {
        if (body.errors) {
          setFieldErrors(body.errors);
        } else {
          setFormError(body.message ?? "Authentication failed.");
        }
        return;
      }
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: body.token }),
      });
      // Platform admins go to the dashboard
      window.location.href = "/platform/dashboard";
    } catch {
      setFormError("Network error — check your connection and retry.");
    } finally {
      setSaving(false);
    }
  }

  const err = (name: string) => fieldErrors[name]?.[0];

  return (
    <form action={submit} className="space-y-4" noValidate>
      <Input name="email" type="email" label="Work email" error={err("email")}
        autoComplete="email" required />
      <Input name="password" type="password" label="Password"
        error={err("password")}
        autoComplete="current-password" required />
      {formError && <p role="alert" className="text-sm font-medium text-bad-fg">{formError}</p>}
      <Button type="submit" loading={saving} className="w-full">
        Log in
      </Button>
    </form>
  );
}