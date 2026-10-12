// Shared driver row shape as returned by GET /api/v1/drivers (cursor page).
export interface DriverListItem {
  id: number;
  onboarding_status: string;
  approved_at: string | null;
  home_address: string | null;
  home_lat: number | null;
  home_lng: number | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;
  seats: number | null;
  license_number: string | null;
  license_expiry: string | null;
  active_assignments_count: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    is_active: boolean;
    role?: { name: string };
  };
}

export interface DriverDocument {
  id: number;
  type: string;
  file_path: string;
  mime_type: string | null;
  verified_at: string | null;
  created_at: string;
}

// Detail shape from GET /api/v1/drivers/{id} (same fields as the list row).
export type DriverDetail = DriverListItem & {
  documents?: DriverDocument[];
};