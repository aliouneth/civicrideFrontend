"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function NewPlatformUserForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function submit(form: FormData) {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    const payload = {
      name: (form.get("name") as string).trim(),
      email: (form.get("email") as string).trim(),
      password: form.get("password"),
      password_confirmation: form.get("password_confirmation"),
    };
    try {
      const res = await fetch("/api/platform/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        if (body.errors) setFieldErrors(body.errors);
        else setError(body.message ?? "Failed to create user.");
        return;
      }
      router.refresh();
      formRef.current?.reset();
    } catch {
      setError("Network error — check your connection and retry.");
    } finally {
      setSaving(false);
    }
  }

  const err = (name: string) => fieldErrors[name]?.[0];

  return (
      <form ref={formRef} action={submit} className="mt-4 space-y-3 rounded-lg border border-line bg-card p-4" noValidate>
      <h2 className="font-semibold">Add platform user</h2>
      <Input name="name" label="Name" error={err("name")} required />
      <Input name="email" type="email" label="Email" error={err("email")} required />
      <Input name="password" type="password" label="Password" hint="Minimum 10 characters." error={err("password")} required />
      <Input name="password_confirmation" type="password" label="Confirm password" required />
      {error && <p role="alert" className="text-sm font-medium text-bad-fg">{error}</p>}
      <Button type="submit" loading={saving}>Create user</Button>
    </form>
  );
}
