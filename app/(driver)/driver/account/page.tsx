import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { DocumentUpload } from "./_components/DocumentUpload";

export const metadata: Metadata = { title: "Account" };

interface DriverProfile {
  id: number;
  availability: { weekday: number; start_time: string; end_time: string }[];
  documents: { id: number; type: string; file_path: string; mime_type: string | null; verified_at: string | null; created_at: string }[];
}

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const me = await apiFetch<{ name: string; email: string; role: { name: string }; driver_profile: DriverProfile | null }>(
    "/auth/me", session,
  ).catch(() => null);

  if (!me) redirect("/login");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Account</h1>
        <Link
          href="/driver/account/edit"
          className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          Edit My Info
        </Link>
      </div>
      <Card className="mt-4">
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2"><dt className="w-16 shrink-0 font-semibold text-ink-500">Name</dt><dd>{me.name}</dd></div>
          <div className="flex gap-2"><dt className="w-16 shrink-0 font-semibold text-ink-500">Email</dt><dd>{me.email}</dd></div>
          <div className="flex gap-2"><dt className="w-16 shrink-0 font-semibold text-ink-500">Role</dt><dd className="capitalize">{me.role.name}</dd></div>
        </dl>
      </Card>

      {me.driver_profile && (
        <Card className="mt-4 p-6">
          <h2 className="text-lg font-semibold">Documents</h2>
          <p className="mt-1 text-sm text-ink-500">
            License, insurance, registration, or background check files.
          </p>
          <div className="mt-4">
            <DocumentUpload documents={me.driver_profile.documents ?? []} />
          </div>
        </Card>
      )}
    </div>
  );
}
