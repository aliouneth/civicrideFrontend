"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const ROLES = [
  { value: "scheduler", label: "Dispatcher" },
  { value: "admin", label: "Admin" },
  { value: "driver", label: "Driver" },
];

// Create an agency user. The generated one-time password is shown once here so
// the supervisor can hand it to the new person (no email infrastructure yet).
export function InviteUserForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  async function submit(form: FormData) {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setCreated(null);
    const payload = {
      name: (form.get("name") as string).trim(),
      email: (form.get("email") as string).trim(),
      phone: ((form.get("phone") as string) ?? "").trim() || null,
      role: form.get("role"),
    };
    try {
      const res = await fetch("/api/users/invite", {
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
      setCreated({ email: payload.email, password: body.temporary_password });
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
    <form ref={formRef} action={submit} className="mt-6 space-y-3 rounded-xl border border-line bg-card p-4" noValidate>
      <h2 className="font-semibold">Add agency user</h2>

      {created && (
        <div className="rounded-lg border border-line bg-ok-bg px-4 py-3 text-sm">
          <p className="font-semibold text-ok-fg">User created — {created.email}</p>
          <p className="mt-1 text-ink-700">
            Share this one-time password. It is not stored and cannot be shown again.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="tnum rounded bg-card px-2 py-1 font-mono text-base">{created.password}</code>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void navigator.clipboard?.writeText(created.password)}
            >
              Copy
            </Button>
          </div>
        </div>
      )}

      <Input name="name" label="Name" error={err("name")} required />
      <Input name="email" type="email" label="Email" error={err("email")} required />
      <Input name="phone" type="tel" label="Phone" hint="Optional." error={err("phone")} />
      <label className="flex flex-col gap-1 text-sm font-medium text-ink-700">
        Role
        <select
          name="role"
          defaultValue="scheduler"
          className="rounded-lg border border-line bg-card px-3 py-2.5 text-base font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
          suppressHydrationWarning
        >
          {[
            { value: "scheduler", label: "Dispatcher" },
            { value: "admin", label: "Admin" },
            { value: "driver", label: "Driver" },
          ].map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        {err("role") && <p role="alert" className="text-sm font-medium text-bad-fg">{err("role")}</p>}
      </label>

      {error && <p role="alert" className="text-sm font-medium text-bad-fg">{error}</p>}
      <Button type="submit" loading={saving}>Create user</Button>
    </form>
  );
}
