import { cookies } from "next/headers";
import { apiFetch, type User } from "./api";

// Server-side session: token + tenant live in httpOnly cookies (set by
// POST /api/auth/session at login). Client components never see the token.
export async function getSession(): Promise<{ token: string; tenant: string } | null> {
  const store = await cookies();
  const token = store.get("cr_token")?.value;
  const tenant = store.get("cr_tenant")?.value ?? "";
  return token ? { token, tenant } : null;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  try {
    return await apiFetch<User>("/auth/me", session);
  } catch {
    return null;
  }
}

export function roleHome(role: string): string {
  // Schedulers manage the board; drivers live in the mobile shell.
  return role === "driver" ? "/driver" : "/dashboard";
}
