"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { DriverDetail } from "../../../_components/types";

const STATUS_OPTIONS = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
];

export function DriverEditForm({ driver }: { driver: DriverDetail }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = STATUS_OPTIONS.some((o) => o.value === driver.onboarding_status)
    ? STATUS_OPTIONS
    : [
        { value: driver.onboarding_status, label: driver.onboarding_status.replace(/_/g, " ") },
        ...STATUS_OPTIONS,
      ];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim() || null;
    const number = (key: string) => {
      const raw = form.get(key);
      return raw && raw !== "" ? Number(raw) : null;
    };

    const body = {
      name: text("name"),
      email: text("email"),
      home_address: text("home_address"),
      home_lat: number("home_lat"),
      home_lng: number("home_lng"),
      vehicle_make: text("vehicle_make"),
      vehicle_model: text("vehicle_model"),
      vehicle_year: number("vehicle_year"),
      vehicle_color: text("vehicle_color"),
      vehicle_plate: text("vehicle_plate"),
      seats: number("seats"),
      license_number: text("license_number"),
      license_expiry: text("license_expiry"),
      onboarding_status: String(form.get("onboarding_status") ?? "pending"),
    };

    try {
      const res = await fetch(`/api/drivers/${driver.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = (data as { errors?: Record<string, string[]>; message?: string }).errors
          ? Object.values((data as { errors: Record<string, string[]> }).errors).flat().join(" ")
          : (data as { message?: string }).message ?? "Could not save driver.";
        throw new Error(message);
      }
      router.push("/drivers");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save driver.");
      setSaving(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-4 gap-3">
          <Input name="name" label="Full name" defaultValue={driver.user.name} required />
          <Input name="email" label="Email" type="email" defaultValue={driver.user.email} required />
        </div>

        <Input
          name="home_address"
          label="Home base address"
          defaultValue={driver.home_address ?? ""}
          placeholder="e.g. 123 Main St"
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="home_lat"
            label="Latitude"
            type="number"
            step="any"
            min={-90}
            max={90}
            defaultValue={driver.home_lat != null ? String(driver.home_lat) : ""}
            className="hidden"
            required
          />
          <Input
            name="home_lng"
            label="Longitude"
            type="number"
            step="any"
            min={-180}
            max={180}
            defaultValue={driver.home_lng != null ? String(driver.home_lng) : ""}
            className="hidden"
            required
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Vehicle</legend>
          <div className="grid grid-cols-4 gap-3">
            <Input name="vehicle_make" label="Make" defaultValue={driver.vehicle_make ?? ""} />
            <Input name="vehicle_model" label="Model" defaultValue={driver.vehicle_model ?? ""} />
            <Input
              name="vehicle_year"
              label="Year"
              type="number"
              min={2000}
              max={2030}
              defaultValue={driver.vehicle_year != null ? String(driver.vehicle_year) : ""}
            />
            <Input name="vehicle_color" label="Color" defaultValue={driver.vehicle_color ?? ""} />
            <Input name="vehicle_plate" label="Plate" defaultValue={driver.vehicle_plate ?? ""} />
            <Input name="seats" label="Seats" type="number" min={1} max={30} defaultValue={driver.seats != null ? String(driver.seats) : ""} />
          </div>
        </fieldset>

        <div className="grid grid-cols-4 gap-3">
          <Input name="license_number" label="License number" defaultValue={driver.license_number ?? ""} />
          <Input name="license_expiry" label="License expiry" type="date" defaultValue={driver.license_expiry ? driver.license_expiry.slice(0, 10) : ""} />
        </div>

        <Select
          name="onboarding_status"
          label="Onboarding status"
          options={statusOptions}
          defaultValue={driver.onboarding_status}
        />

        {error && (
          <p role="alert" className="rounded-lg border border-line bg-bad-bg px-4 py-3 text-sm font-medium text-bad-fg">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
          <Link
            href="/drivers"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-base font-semibold text-ink-900 transition-colors duration-200 ease-out hover:bg-paper"
          >
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}