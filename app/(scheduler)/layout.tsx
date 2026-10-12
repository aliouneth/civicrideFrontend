import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { NavLinks, type NavLink } from "@/components/ui/NavLinks";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "@/components/ui/LogoutButton";

// Scheduler shell: navy brand rail on desktop, white tab bar on mobile.
// Drivers are sent to /driver.
const LINKS: NavLink[] = [
  { href: "/agency-dashboard", label: "Agency Dashboard" },
  { href: "/dashboard", label: " Dispatch Board" },
  { href: "/rides/new", label: "New ride" },
  { href: "/drivers", label: "Drivers" },
  { href: "/reports", label: "Reports" },
];

export default async function SchedulerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role.name === "driver") redirect("/driver");

  // Fetch tenant name for display
  const session = await getSession();
  let tenantName = "";
  if (session) {
    try {
      const tenantRes = await apiFetch<{ name: string }>("/tenant", session);
      tenantName = tenantRes.name ?? "";
    } catch {}
  }

  // Agency Users is a supervisor-only management surface.
  const links: NavLink[] = user.role.name === "supervisor"
    ? [...LINKS, { href: "/agency-users", label: "Agency Users" }]
    : LINKS;

  return (
    <div className="min-h-dvh lg:flex">
      <header className="border-b border-line bg-card lg:hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Logo height={28} priority />
          <span className="truncate text-sm font-semibold text-ink-500">{user.name}</span>
        </div>
        <nav aria-label="Scheduler" className="flex gap-1 overflow-x-auto p-2">
          <NavLinks links={LINKS} variant="tabs" />
        </nav>
      </header>

      <aside className="bg-brand-gradient hidden w-64 shrink-0 flex-col p-4 lg:flex">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-2 py-1">
          <Logo variant="mark" height={40} plated priority />
          <span className="text-lg font-bold tracking-tight text-white">CivicRide</span>
          {tenantName && (
            <span className="text-xs font-medium text-white/70 truncate max-w-[100px] ml-1">{tenantName}</span>
          )}
        </Link>

        <p className="mt-4 truncate px-2 text-sm text-white/70">{user.name}</p>

        <nav aria-label="Scheduler" className="mt-4 space-y-1">
          <NavLinks links={links} />
        </nav>

        <div className="mt-auto px-2 pt-6">
          <LogoutButton variant="onBrand" className="w-full" />
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-6">{children}</main>
    </div>
  );
}