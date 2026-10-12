"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface DriverFormValues {
  name: string;
  email: string;
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
}

export default function EditDriverPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState<DriverFormValues>({
    name: "",
    email: "",
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
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      // Would POST to /api/v1/drivers/:id with updated data
      setError(null);
      router.push("/drivers");
    } catch {
      setError("Failed to update driver. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Edit Driver {id ? `(ID: ${id})` : ""}</h1>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        <Input
          name="name"
          label="Full name"
          defaultValue={form.name}
          required
        />
        <Input
          name="email"
          label="Email"
          type="email"
          defaultValue={form.email}
          required
        />
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
          <Button type="submit" className="w-full">
            {saving ? "Updating…" : "Update"}
          </Button>
        </div>

        {error && <p role="alert" className="text-sm font-medium text-brand-700 mt-2">{error}</p>}
      </form>
    </div>
  );
}