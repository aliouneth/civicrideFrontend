import { cookies } from "next/headers";
import { apiFetch, type User } from "./api";
import { normalizeTimezone, TIMEZONE_COOKIE } from "./timezone";

// Server-side session: token + tenant live in httpOnly cookies (set by
// POST /api/auth/session at login). The zone is the user's own, written by
// <TimezoneSync />; client components never see the token.
export async function getSession(): Promise<{ token: string; tenant: string; timezone: string } | null> {
  const store = await cookies();
  const token = store.get("cr_token")?.value;
  if (!token) return null;

  const tenant = store.get("cr_tenant")?.value ?? "";
  const zone = store.get(TIMEZONE_COOKIE)?.value;

  return { token, tenant, timezone: normalizeTimezone(zone) ?? "UTC" };
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
