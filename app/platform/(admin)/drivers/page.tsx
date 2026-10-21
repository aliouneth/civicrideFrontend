"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface DriverRow {
  id: number;
  user_name: string | null;
  user_email: string | null;
  active_assignments_count: number;
  home_address: string | null;
  home_lat: number | null;
  home_lng: number | null;
  onboarding_status: string;
  approved_at: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;
  seats: number | null;
  license_number: string | null;
  license_expiry: string | null;
}

export default function PlatformDriversPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverRow | null>(null);

  // Load drivers from API
  const loadDrivers = async (search: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/drivers?search=${encodeURIComponent(search)}&page=${pageNum}`,
        {
          credentials: "include",
          headers: { "X-Tenant": "platform" },
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.message ?? body.errors ?? ["Could not load drivers."]
        );
      }
      const data = await res.json();
      setDrivers(data.data ?? []);
      setPage(data.meta?.current_page ?? pageNum);
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Failed to load drivers.");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDrivers(searchQuery, 1);
  }, [searchQuery]);

  const handleDelete = async (driverId: number) => {
    if (!window.confirm("Remove this driver?")) return;
    setLoading(true);
    try {
      await fetch(
        `/api/drivers/${driverId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "X-Tenant": "platform" },
        }
      );
      setError(null);
      loadDrivers(searchQuery, 1);
    } catch (e: any) {
      setError(e.message ?? "Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (driver?: DriverRow) => {
    setEditingDriver(driver ?? { id: 0, user_name: null, user_email: null, active_assignments_count: 0, home_address: null, home_lat: null, home_lng: null, onboarding_status: "pending", approved_at: null, vehicle_make: null, vehicle_model: null, vehicle_year: null, vehicle_color: null, vehicle_plate: null, seats: null, license_number: null, license_expiry: null });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDriver(null);
    setSearchQuery("");
    router.refresh();
  };

  const saveDriver = async () => {
    if (!editingDriver) return;
    setLoading(true);
    try {
      const method = editingDriver.id ? "PATCH" : "POST";
      await fetch(
        `/api/drivers${editingDriver.id ? `/${editingDriver.id}` : ""}`,
        {
          method,
          credentials: "include",
          headers: { "Content-Type": "application/json", "X-Tenant": "platform" },
          body: JSON.stringify({
            home_address: editingDriver.home_address,
            home_lat: editingDriver.home_lat,
            home_lng: editingDriver.home_lng,
            onboarding_status: editingDriver.onboarding_status,
            vehicle_make: editingDriver.vehicle_make,
            vehicle_model: editingDriver.vehicle_model,
            vehicle_year: editingDriver.vehicle_year,
            vehicle_color: editingDriver.vehicle_color,
            vehicle_plate: editingDriver.vehicle_plate,
            seats: editingDriver.seats,
            license_number: editingDriver.license_number,
            license_expiry: editingDriver.license_expiry,
          }),
        }
      );
      setError(null);
      closeModal();
      loadDrivers(searchQuery, 1);
    } catch (e: any) {
      setError(e.message ?? "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6">
        <p className="text-sm text-ink-500">Loading drivers…</p>
      </div>
    );
  }

  // Format home base display
  const formatHomeBase = (driver: DriverRow) => {
    if (!driver.home_address) return "—";
    const coords = driver.home_lat != null && driver.home_lng != null
      ? ` (${Number(driver.home_lat).toFixed(2)}, ${Number(driver.home_lng).toFixed(2)})`
      : "";
    return `${driver.home_address}${coords}`;
  };

  // Format onboarding status badge class
  const statusClass = (status: string) => {
    if (status === "approved") return "bg-brand-100 text-brand-800";
    return "bg-muted/30 text-muted-foreground";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Drivers</h1>

      <Card className="mt-4">
        <div className="flex gap-3 mb-4">
          <Input
            placeholder="Search drivers by name…"
            value={searchQuery}
            onChange={(e) => {
              const q = e.target.value;
              setSearchQuery(q);
              loadDrivers(q, 1);
            }}
            aria-label="Search drivers"
            label="Search drivers"
          />
          <Link href="/platform/drivers/new" className="btn">
            <Button variant="accent">New driver</Button>
          </Link>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-brand-700 mt-2">
            {error}
          </p>
        )}

        {drivers.length === 0 ? (
          <p className="text-sm text-ink-500 mt-4">
            No drivers found.{" "}
            <a href="/platform/drivers/new" className="underline">
              Add your first driver
            </a>
          </p>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full rounded-xl border border-line bg-card">
              <thead>
                <tr className="border-b border-line text-sm font-medium text-ink-500">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Active assignments</th>
                  <th className="p-4">Home base</th>
                  <th className="p-4">Onboarding status</th>
                  <th className="p-4 text-right">Vehicle</th>
                  <th className="p-4 text-right">License</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-line bg-card hover:bg-brand-50">
                    <td className="p-4">{driver.user_name ?? "—"}</td>
                    <td className="p-4">{driver.user_email ?? "—"}</td>
                    <td className="p-4">{driver.active_assignments_count}</td>
                    <td className="p-4">{formatHomeBase(driver)}</td>
                    <td className="p-4">
                      <span className={statusClass(driver.onboarding_status)}>
                        {driver.onboarding_status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-medium small">
                        {driver.vehicle_make}
                        {driver.vehicle_model && ` ${driver.vehicle_model}`}
                        {driver.vehicle_year && ` (${driver.vehicle_year})`}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-xs text-muted-foreground">
                        {driver.license_number ?? "—"}
                      </span>
                      {driver.license_expiry && (
                        <span className="text-caption text-muted-foreground">
                          expires {driver.license_expiry.slice(0, 10)}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        onClick={() => openModal(driver)}
                        className="flex items-center gap-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(driver.id)}
                        className="flex items-center gap-1"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit/Add Driver Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center">
            <div className="bg-card rounded-xl p-6 w-full max-w-md max-transform scale-100">
              <h2 className="text-xl font-semibold mb-4">
                {editingDriver?.id ? "Edit driver" : "Add driver"}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveDriver();
                }}
              >
                <Input
                  name="name"
                  label="Name"
                  defaultValue={editingDriver?.user_name ?? ""}
                  disabled
                  className="mb-3"
                />
                <Input
                  name="email"
                  label="Email"
                  defaultValue={editingDriver?.user_email ?? ""}
                  disabled
                  className="mb-3"
                />
                <Input
                  name="home_address"
                  label="Home address"
                  defaultValue={editingDriver?.home_address ?? ""}
                  required
                  className="mb-3"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    name="home_lat"
                    type="number"
                    step="any"
                    label="Latitude"
                    defaultValue={editingDriver?.home_lat != null ? String(editingDriver.home_lat) : ""}
                    required
                  />
                  <Input
                    name="home_lng"
                    type="number"
                    step="any"
                    label="Longitude"
                    defaultValue={editingDriver?.home_lng != null ? String(editingDriver.home_lng) : ""}
                    required
                  />
                </div>
                <Input
                  name="onboarding_status"
                  label="Onboarding status"
                  defaultValue={editingDriver?.onboarding_status ?? "pending"}
                  className="mb-4"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    name="vehicle_make"
                    label="Make"
                    defaultValue={editingDriver?.vehicle_make ?? ""}
                  />
                  <Input
                    name="vehicle_model"
                    label="Model"
                    defaultValue={editingDriver?.vehicle_model ?? ""}
                  />
                  <Input
                    name="vehicle_year"
                    type="number"
                    step="any"
                    label="Year"
                    defaultValue={editingDriver?.vehicle_year != null ? String(editingDriver.vehicle_year) : ""}
                  />
                  <Input
                    name="vehicle_color"
                    label="Color"
                    defaultValue={editingDriver?.vehicle_color ?? ""}
                  />
                  <Input
                    name="vehicle_plate"
                    label="Plate"
                    defaultValue={editingDriver?.vehicle_plate ?? ""}
                  />
                  <Input
                    name="seats"
                    type="number"
                    step="1"
                    label="Seats"
                    defaultValue={editingDriver?.seats != null ? String(editingDriver.seats) : ""}
                  />
                  <Input
                    name="license_number"
                    label="License number"
                    defaultValue={editingDriver?.license_number ?? ""}
                  />
                  <Input
                    name="license_expiry"
                    type="date"
                    label="License expiry"
                    defaultValue={editingDriver?.license_expiry ?? ""}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingDriver?.id ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    onClick={closeModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}