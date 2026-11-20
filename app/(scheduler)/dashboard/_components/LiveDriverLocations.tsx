"use client";

import { useEffect, useState } from "react";

type DriverLocation = {
  driver_id: number;
  driver_name: string;
  ride_id: number;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  recorded_at: string;
};

export function LiveDriverLocations() {
  const [locations, setLocations] = useState<DriverLocation[]>([]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/drivers/locations", { cache: "no-store" });
        if (!response.ok) return;
        const body = await response.json();
        if (active) setLocations(body.data ?? []);
      } catch {}
    };
    void refresh();
    const timer = setInterval(refresh, 15000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  return (
    <section className="mt-5 rounded-xl border border-line bg-card p-4" aria-live="polite">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Drivers on active rides</h2>
        <span className="text-xs text-ink-500">Refreshes every 15 seconds · recent location updates</span>
      </div>
      {locations.length === 0 ? (
        <p className="mt-2 text-sm text-ink-500">No current driver locations. Drivers share their position while an active ride is open in the driver app.</p>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {locations.map((location) => (
            <article key={location.driver_id} className="rounded-lg border border-line p-3">
              <div className="flex justify-between gap-2">
                <p className="font-semibold">{location.driver_name}</p>
                <span className="text-xs text-ink-500">Ride #{location.ride_id} · {location.status.replaceAll("_", " ")}</span>
              </div>
              <p className="mt-1 text-sm text-ink-500">{location.pickup_address} → {location.dropoff_address}</p>
              <p className="mt-2 text-xs text-ink-500">
                {Number(location.latitude).toFixed(5)}, {Number(location.longitude).toFixed(5)}
                {location.accuracy_meters != null ? ` · ±${Math.round(location.accuracy_meters)} m` : ""}
                {` · ${new Date(location.recorded_at).toLocaleTimeString()}`}
              </p>
              <a className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline" target="_blank" rel="noreferrer"
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}>Open in map</a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
