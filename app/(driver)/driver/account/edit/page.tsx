import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import AccountEditForm from "./AccountEditForm";

export const metadata: Metadata = { title: "Edit Account" };

export default async function AccountEditPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const me = await apiFetch<{
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
  }>("/auth/me", session).catch(() => null);

  if (!me) redirect("/login");

  return <AccountEditForm initialData={me} />;
}