import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DriverEditForm } from "./_components/DriverEditForm";
import { DocumentUpload } from "../../_components/DocumentUpload";
import type { DriverDetail } from "../../_components/types";

export const metadata = { title: "Edit Driver" } satisfies Metadata;

export const dynamic = "force-dynamic";

export default async function EditDriverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  let driver: DriverDetail | null = null;
  let error: string | null = null;
  if (session) {
    try {
      driver = await apiFetch<DriverDetail>(`/drivers/${id}`, session);
    } catch (e) {
      error = e instanceof Error ? e.message : "Could not load driver.";
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link
        href="/drivers"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Back to drivers
      </Link>

      <div className="mb-5 mt-3">
        <p className="text-sm font-semibold text-brand-700">Agency</p>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Edit driver</h1>
        {driver && (
          <p className="mt-1 text-sm text-ink-500">
            {driver.user.name} · {driver.user.email}
          </p>
        )}
      </div>

      {error || !driver ? (
        <Card className="p-6">
          <p className="text-sm font-medium text-bad-fg">
            {error ?? "Driver not found."}
          </p>
          <Link href="/drivers" className="mt-4 inline-block">
            <Button variant="ghost">Back to drivers</Button>
          </Link>
        </Card>
      ) : (
        <>
          <DriverEditForm driver={driver} />
          <Card className="mt-6 p-6">
            <h2 className="text-lg font-semibold">Documents</h2>
            <p className="mt-1 text-sm text-ink-500">
              License, insurance, registration, or background check files.
            </p>
            <div className="mt-4">
              <DocumentUpload driverId={driver.id} documents={driver.documents ?? []} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}