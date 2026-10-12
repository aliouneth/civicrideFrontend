import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { NewPlatformUserForm } from "./NewPlatformUserForm";
import { PlatformUsersList } from "./PlatformUsersList";

export const metadata = { title: "Platform Admin — Users" } satisfies Metadata;

export const dynamic = "force-dynamic";

export default async function PlatformUsersPage() {
  const session = await getSession();
  const users = session
    ? await apiFetch<{ data: { id: number; name: string; email: string; is_active: boolean }[] }>("/platform/users", session).catch(() => null)
    : null;
  const list = users?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold">Platform users</h1>
      <p className="mt-1 text-sm text-ink-500">Super administrators with access to this area.</p>
      {list.length > 0 ? (
        <PlatformUsersList users={list} />
      ) : (
        <p className="mt-4 text-sm text-ink-500">No platform users.</p>
      )}

      <NewPlatformUserForm />
    </div>
  );
}
