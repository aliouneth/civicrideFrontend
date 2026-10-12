"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

  const [agencyQuery, setAgencyQuery] = useState<string>("");
  const [agencies, setAgencies] = useState<any[]>([]);
  const [agencyHover, setAgencyHover] = useState(-1);

  useEffect(() => {
    if (mode === "register" && agencyQuery.length >= 2) {
      fetch(`/api/agencies?q=${encodeURIComponent(agencyQuery)}`)
        .then((res) => res.json())
        .then((data) => setAgencies(data))
        .catch(() => setAgencies([]));
    } else if (agencyQuery.length === 0) {
      setAgencies([]);
    }
  }, [agencyQuery, mode]);

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

    const formTenant = mode === "register" ? (form.get("tenant") as string).trim() : "";
    const payload = Object.fromEntries(form.entries());

    if (mode === "register" && !turnstileToken) {
      setFormError("Please complete the security check.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/${mode}`,
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
          <Input
            name="tenant"
            label="Agency code"
            error={err("tenant")}
            autoComplete="organization"
            value={agencyQuery}
            onChange={(e) => setAgencyQuery(e.target.value)}
            required />
          {agencies.length > 0 && (
            <div className="absolute right-0 w-80 mt-1 rounded-xl border border-layer bg-layer shadow-md z-50 max-h-80 overflow-y-auto">
              {agencies.map((agency) => {
                const isHover = agencyHover === agencies.indexOf(agency);
                return (
                  <div
                    key={agency.id}
                    onMouseOver={() => setAgencyHover(agencies.indexOf(agency))}
                    onMouseOut={() => setAgencyHover(-1)}
                    className={`block py-2 px-4 text-sm ${isHover ? "bg-layer-200 text-ink-900" : "text-ink-700 hover:bg-layer-200"}`}
                  >
                    <span className="font-medium">{agency.name}</span>
                    <span className="text-xs text-ink-500">{agency.slug}</span>
                  </div>
                );
              })}
            </div>
          )}
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