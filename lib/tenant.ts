import { headers } from "next/headers";

// Resolve the tenant slug: explicit cookie first (set at login), else subdomain.
// Mirrors backend ResolveTenant precedence (header → subdomain).
export async function resolveTenantSlug(): Promise<string | null> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const fromCookie = store.get("cr_tenant")?.value;
  if (fromCookie) return fromCookie;

  const host = (await headers()).get("host") ?? "";
  const parts = host.split(".");
  return parts.length > 2 ? parts[0] : null;
}
