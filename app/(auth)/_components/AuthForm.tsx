"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        theme?: "light" | "dark" | "auto";
        callback?: (token: string) => void;
        "expired-callback"?: () => void;
        "error-callback"?: () => void;
      }) => string;
      reset: (widgetId: string) => void;
    };
    turnstileReady: boolean;
    onTurnstileLoad: () => void;
  }
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const [agencySlug, setAgencySlug] = useState<string>("");
  const [agencies, setAgencies] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [agenciesError, setAgenciesError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "register") return;
    let cancelled = false;
    setLoadingAgencies(true);
    setAgenciesError(null);
    fetch(`/api/agencies`)
      .then((res) => {
        if (!res.ok) throw new Error(`Agencies request failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data.data ?? []);
        setAgencies(list);
      })
      .catch(() => {
        if (!cancelled) setAgenciesError("Could not load agencies. Please retry.");
      })
      .finally(() => {
        if (!cancelled) setLoadingAgencies(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkTurnstile = () => {
      if (window.turnstile) {
        setScriptLoaded(true);
        window.turnstileReady = true;
        if (window.onTurnstileLoad) window.onTurnstileLoad();
      } else {
        setTimeout(checkTurnstile, 100);
      }
    };
    checkTurnstile();

    window.onTurnstileLoad = () => {
      setScriptLoaded(true);
      window.turnstileReady = true;
    };
  }, []);

  useEffect(() => {
    if (mode === "register" && turnstileRef.current && window.turnstile && scriptLoaded) {
      const widgetId = window.turnstile.render(turnstileRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
        theme: "light",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      });
      setTurnstileWidgetId(widgetId);
    }
  }, [mode, scriptLoaded]);

  useEffect(() => {
    if (mode !== "register" && turnstileWidgetId && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId);
      setTurnstileToken("");
      setTurnstileWidgetId(null);
    }
  }, [mode, turnstileWidgetId]);

  async function submit(form: FormData) {
    setSaving(true);
    setFieldErrors({});
    setFormError(null);

    const formTenant = mode === "register" ? agencySlug.trim() : "";
    const payload = Object.fromEntries(form.entries());

    if (mode === "register" && !formTenant) {
      setFieldErrors({ tenant: ["Please select your agency."] });
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      setSaving(false);
      return;
    }

    if (mode === "register" && !turnstileToken) {
      setFormError("Please complete the security check.");
      setSaving(false);
      return;
    }

    try {
      // Same-origin BFF proxy (app/api/[...path]) — avoids CORS entirely.
      // Server forwards to Laravel with the X-Tenant header.
      const res = await fetch(`/api/auth/${mode}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(mode !== "login" && { "X-Tenant": formTenant }),
          },
          body: JSON.stringify({ ...payload, turnstile_token: turnstileToken }),
        },
      );
      const body = await res.json();
      if (!res.ok) {
        if (body.errors) {
          setFieldErrors(body.errors);
          document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
        } else {
          setFormError(body.message ?? "Authentication failed.");
        }
        return;
      }
      const tenantForSession = body.tenant ?? (mode === "register" ? formTenant : "");
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: body.token, tenant: tenantForSession }),
      });
      if (mode === "register") {
        router.push("/registration-confirmed");
      } else {
        const isDriver = body.user.role?.name === "driver";
        const onboardingStatus = body.user.driver_profile?.onboarding_status ?? "applied";
        const isApproved = onboardingStatus === "approved";
        const defaultPath = isDriver ? (isApproved ? "/driver" : "/driver/account") : "/dashboard";
        router.push(params.get("next") ?? defaultPath);
      }
      router.refresh();
    } catch {
      setFormError("Network error — check your connection and retry.");
    } finally {
      setSaving(false);
    }
  }

  const err = (name: string) => fieldErrors[name]?.[0];

  return (
    <form action={submit} className="space-y-4" noValidate>
      {mode === "register" && (
        <>
          <Select
            name="tenant"
            label="Agency"
            error={err("tenant") ?? agenciesError ?? undefined}
            value={agencySlug}
            onChange={(e) => setAgencySlug(e.target.value)}
            options={[
              { value: "", label: loadingAgencies ? "Loading agencies…" : "Select your agency…" },
              ...agencies.map((agency) => ({
                value: agency.slug,
                label: `${agency.name} (${agency.slug})`,
              })),
            ]}
            required
          />
          <Input name="name" label="Full name" error={err("name")} autoComplete="name" required />
          <Input name="phone" type="tel" label="Phone" error={err("phone")}
            hint="For dispatch SMS, e.g. +1 555 010 2030." autoComplete="tel" />
          <Input name="license_number" label="License number" error={err("license_number")}
            autoComplete="off" required />
          <Input name="license_expiry" type="date" label="License expiry" error={err("license_expiry")}
            required />
          <Input name="vehicle_make" label="Vehicle make" error={err("vehicle_make")} required />
          <Input name="vehicle_model" label="Vehicle model" error={err("vehicle_model")} required />
          <Input name="vehicle_year" type="number" label="Vehicle year" error={err("vehicle_year")}
            min="1990" max={new Date().getFullYear() + 1} required />
          <Input name="vehicle_color" label="Vehicle color" error={err("vehicle_color")} required />
          <Input name="vehicle_plate" label="License plate" error={err("vehicle_plate")} required />
          <Input name="email" type="email" label="Work email" error={err("email")}
            autoComplete="email" required />
          <Input name="password" type="password" label="Password" error={err("password")}
            hint="Minimum 8 characters." autoComplete="new-password" required />
          <Input name="password_confirmation" type="password" label="Confirm password"
            error={err("password_confirmation")} autoComplete="new-password" required />
          <div ref={turnstileRef} className="flex justify-center" />
        </>
      )}
      {mode === "login" && (
        <>
          <Input name="email" type="email" label="Work email" error={err("email")}
            autoComplete="email" required />
          <Input name="password" type="password" label="Password" error={err("password")}
            autoComplete="current-password" required />
        </>
      )}
      {formError && <p role="alert" className="text-sm font-medium text-bad-fg">{formError}</p>}
      <Button type="submit" loading={saving} className="w-full">
        {mode === "login" ? "Log in" : "Create driver account"}
      </Button>
    </form>
  );
}