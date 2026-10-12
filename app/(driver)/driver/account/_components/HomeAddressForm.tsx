"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface HomeBase {
  home_address: string | null;
  home_lat: number | null;
  home_lng: number | null;
}

// Home base drives total ride mileage (home → pickup → drop-off → home).
export function HomeAddressForm({ initial }: { initial: HomeBase }) {
  const router = useRouter();
  const [address, setAddress] = useState(initial.home_address ?? "");
  const [lat, setLat] = useState(initial.home_lat != null ? String(initial.home_lat) : "");
  const [lng, setLng] = useState(initial.home_lng != null ? String(initial.home_lng) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/drivers/me/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home_address: address, home_lat: Number(lat), home_lng: Number(lng) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? Object.values(body.errors ?? {}).flat()[0] as string ?? "Could not save your home address.");
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input
        label="Home address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="123 Main St, Springfield"
        required
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Latitude" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} required />
        <Input label="Longitude" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} required />
      </div>
      {error && <p role="alert" className="text-sm font-medium text-bad-fg">{error}</p>}
      {saved && <p role="status" className="text-sm font-medium text-brand-700">Home address saved.</p>}
      <Button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save home address"}
      </Button>
    </div>
  );
}
