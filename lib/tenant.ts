import { cookies, headers } from "next/headers";

// Resolve the tenant slug: the session cookie first (set at login), else the
// agency subdomain of the public host. Mirrors the backend ResolveTenant
// precedence (explicit header -> public host -> token).

/** Infrastructure labels that are never an agency slug (mirrors backend config/tenancy.php). */
const RESERVED_SUBDOMAINS = new Set([
  "api",
  "www",
  "app",
  "admin",
  "platform",
  "cdn",
  "assets",
  "static",
  "media",
  "dev",
  "staging",
  "test",
  "local",
  "localhost",
]);

/**
 * The agency slug carried by a public host, or null when it carries none.
 *
 * acme.civicride.com -> acme. Bare domains, IP literals and infrastructure
 * subdomains (api/app/staging) carry no tenant.
 */
export function tenantSlugFromHost(host: string | null | undefined): string | null {
  const normalized = (host ?? "").trim().toLowerCase();

  if (!normalized) return null;

  // IPv6 literals ([::1]) keep their brackets, IPv4 literals are dotted.
  if (normalized.includes(":")) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(normalized)) return null;

  const withoutPort = normalized.replace(/:\d+$/, "");
  const baseDomain = (process.env.TENANT_BASE_DOMAIN ?? "civicride.com").trim().toLowerCase();

  if (!baseDomain || !withoutPort.endsWith(`.${baseDomain}`)) return null;

  const label = withoutPort.slice(0, -(baseDomain.length + 1));

  if (!label || label.includes(".")) return null;
  if (RESERVED_SUBDOMAINS.has(label)) return null;

  return label;
}

export async function resolveTenantSlug(): Promise<string | null> {
  const store = await cookies();
  const fromCookie = store.get("cr_tenant")?.value;
  // "platform" is not a slug: it marks a platform administrator session.
  if (fromCookie && fromCookie !== "platform") return fromCookie;

  const host = (await headers()).get("host");
  return tenantSlugFromHost(host);
}
