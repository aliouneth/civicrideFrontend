import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getSession } from "@/lib/auth";
import { apiFetch, type User } from "@/lib/api";
import { AgencyUsersList } from "./_components/AgencyUsersList";
import { InviteUserForm } from "./_components/InviteUserForm";

export const metadata = { title: "Agency Users" } satisfies Metadata;

export const dynamic = "force-dynamic";

export default async function AgencyUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role.name !== "supervisor") redirect("/dashboard");

  const session = await getSession();
  let users: User[] = [];
  let error: string | null = null;
  if (session) {
    try {
      const res = await apiFetch<{ data: User[] }>("/users", session);
      users = res.data ?? [];
    } catch (e) {
      error = e instanceof Error ? e.message : "Could not load users.";
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Agency Users</h1>
      <p className="mt-1 text-sm text-ink-500">
        People with access to this agency — dispatchers, admins, and drivers.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-line bg-bad-bg px-4 py-3 text-sm font-medium text-bad-fg">
          {error}
        </p>
      )}

      <AgencyUsersList users={users} currentUserId={user.id} />
      <InviteUserForm />
    </div>
  );
}
