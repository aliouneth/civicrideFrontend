"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface DriverFormValues {
  home_address: string;
  home_lat: string;
  home_lng: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_color: string;
  vehicle_plate: string;
  seats: string;
  license_number: string;
  license_expiry: string;
  onboarding_status: string;
  agency_id: number | null;
}

export default function NewDriverPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [form, setForm] = useState<DriverFormValues>({
    home_address: "",
    home_lat: "",
    home_lng: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: "",
    vehicle_color: "",
    vehicle_plate: "",
    seats: "1",
    license_number: "",
    license_expiry: "",
    onboarding_status: "pending",
    agency_id: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(true);

  useEffect(() => {
    async function fetchAgencies() {
      try {
        const res = await fetch(
          "/api/v1/agencies?per_page=100",
          {
            credentials: "include",
            headers: { "X-Tenant": "" },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch agencies");
        const data = await res.json();
        setAgencies(data.data ?? []);
      } catch {
        setError("Could not load agencies.");
      } finally {
        setLoadingAgencies(false);
      }
    }
    fetchAgencies();
  }, []);

  useEffect(() => {
    const paramAgency = searchParams.get("agency_id");
    if (paramAgency != null) {
      setForm((f) => ({ ...f, agency_id: Number(paramAgency) }));
    }
  }, [searchParams]);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      await fetch("/api/v1/drivers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "X-Tenant": "" },
        body: JSON.stringify(form),
      });
      setError(null);
      router.push("/platform/drivers");
    } catch {
      setError("Failed to create driver. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">New Driver</h1>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        <Input
          name="home_address"
          label="Home address"
          defaultValue={form.home_address}
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            name="home_lat"
            type="number"
            step="any"
            label="Latitude"
            defaultValue={form.home_lat}
            required
          />
          <Input
            name="home_lng"
            type="number"
            step="any"
            label="Longitude"
            defaultValue={form.home_lng}
            required
          />
        </div>
        <Input
          name="vehicle_make"
          label="Make"
          defaultValue={form.vehicle_make}
        />
        <Input
          name="vehicle_model"
          label="Model"
          defaultValue={form.vehicle_model}
        />
        <Input
          name="vehicle_year"
          type="number"
          step="any"
          label="Year"
          defaultValue={form.vehicle_year}
        />
        <Input
          name="vehicle_color"
          label="Color"
          defaultValue={form.vehicle_color}
        />
        <Input
          name="vehicle_plate"
          label="Plate"
          defaultValue={form.vehicle_plate}
        />
        <Input
          name="seats"
          type="number"
          step="1"
          label="Seats"
          defaultValue={form.seats}
        />
        <Input
          name="license_number"
          label="License number"
          defaultValue={form.license_number}
        />
        <Input
          name="license_expiry"
          type="date"
          label="License expiry"
          defaultValue={form.license_expiry}
        />
        <Input
          name="onboarding_status"
          label="Onboarding status"
          defaultValue={form.onboarding_status}
        />

        <div className="mt-4">
          <p className="text-sm text-ink-500">Agency</p>
          <p className="mt-1">
            Select an agency
          </p>
        </div>

        {loadingAgencies && <p className="text-sm text-ink-500 mt-2">Loading agencies…</p>}
        {error && <p role="alert" className="text-sm font-medium text-brand-700 mt-2">{error}</p>}

        <Button type="submit" className="w-full">
          {saving ? "Creating…" : "Create driver"}
        </Button>
      </form>
    </div>
  );
}