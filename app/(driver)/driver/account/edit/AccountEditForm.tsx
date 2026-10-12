"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFromBrowser, ApiErrorResponse } from "@/lib/api";

interface InitialData {
  name: string;
  email: string;
  phone: string | null;
  driver_profile: {
    license_number: string;
    license_expiry: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    vehicle_color: string;
    vehicle_plate: string;
  } | null;
}

export default function AccountEditForm({ initialData }: { initialData: {
  name: string;
  email: string;
  phone: string | null;
  driver_profile: {
    license_number: string;
    license_expiry: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    vehicle_color: string;
    vehicle_plate: string;
  } | null;
} }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    license_number: initialData?.driver_profile?.license_number ?? "",
    license_expiry: initialData?.driver_profile?.license_expiry?.slice(0, 10) ?? "",
    vehicle_make: initialData?.driver_profile?.vehicle_make ?? "",
    vehicle_model: initialData?.driver_profile?.vehicle_model ?? "",
    vehicle_year: initialData?.driver_profile?.vehicle_year ?? "",
    vehicle_color: initialData?.driver_profile?.vehicle_color ?? "",
    vehicle_plate: initialData?.driver_profile?.vehicle_plate ?? "",
  });

  const err = (name: string) => fieldErrors[name]?.[0];

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const payload = {
        ...formData,
        vehicle_year: formData.vehicle_year === "" ? null : Number(formData.vehicle_year),
      };
      await apiFromBrowser("/drivers/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      router.push("/driver/account");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof ApiErrorResponse) {
        console.error("API Error Response:", err.status, err.body);
        if (err.body.errors) setFieldErrors(err.body.errors);
        else setFormError(err.body.message ?? "Update failed");
      } else {
        console.error("Network Error:", err);
        setFormError("Network error — check your connection and retry.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input name="name" label="Full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} error={err("name")} required />
      <Input name="email" type="email" label="Work email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} error={err("email")} required />
      <Input name="phone" type="tel" label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} error={err("phone")} hint="For dispatch SMS, e.g. +1 555 010 2030." />
      <Input name="license_number" label="License number" value={formData.license_number} onChange={e => setFormData({...formData, license_number: e.target.value})} error={err("license_number")} required />
      <Input name="license_expiry" type="date" label="License expiry" value={formData.license_expiry} onChange={e => setFormData({...formData, license_expiry: e.target.value})} error={err("license_expiry")} required />
      <Input name="vehicle_make" label="Vehicle make" value={formData.vehicle_make} onChange={e => setFormData({...formData, vehicle_make: e.target.value})} error={err("vehicle_make")} required />
      <Input name="vehicle_model" label="Vehicle model" value={formData.vehicle_model} onChange={e => setFormData({...formData, vehicle_model: e.target.value})} error={err("vehicle_model")} required />
      <Input name="vehicle_year" type="number" label="Vehicle year" value={formData.vehicle_year} onChange={e => setFormData({...formData, vehicle_year: e.target.value})} error={err("vehicle_year")} min="1990" max={new Date().getFullYear() + 1} required />
      <Input name="vehicle_color" label="Vehicle color" value={formData.vehicle_color} onChange={e => setFormData({...formData, vehicle_color: e.target.value})} error={err("vehicle_color")} required />
      <Input name="vehicle_plate" label="License plate" value={formData.vehicle_plate} onChange={e => setFormData({...formData, vehicle_plate: e.target.value})} error={err("vehicle_plate")} required />
      {formError && <p role="alert" className="text-sm font-medium text-bad-fg">{formError}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={saving} className="w-full">Save changes</Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} className="w-full" disabled={saving}>Cancel</Button>
      </div>
    </form>
  );
}