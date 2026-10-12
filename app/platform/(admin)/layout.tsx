import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { NavLinks, type NavLink } from "@/components/ui/NavLinks";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "@/components/ui/LogoutButton";

const LINKS: NavLink[] = [
  { href: "/platform/dashboard", label: "Dashboard" },
  { href: "/platform/tenants", label: "Agencies/Tenants" },
  { href: "/platform/users", label: "Platform Users" },
];

export default async function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/platform/login");

  return (
    <div className="min-h-dvh lg:flex">
      <header className="border-b border-line bg-card lg:hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Logo height={28} priority />
          <span className="truncate text-sm font-semibold text-ink-500">{user.name}</span>
        </div>
        <nav aria-label="Platform" className="flex gap-1 overflow-x-auto p-2">
          <NavLinks links={LINKS} variant="tabs" />
        </nav>
      </header>

      <aside className="bg-brand-gradient hidden w-64 shrink-0 flex-col p-4 lg:flex">
        <Link href="/platform/dashboard" className="flex items-center gap-3 rounded-xl px-2 py-1">
          <Logo variant="mark" height={40} plated priority />
          <span className="text-lg font-bold tracking-tight text-white">CivicRide</span>
        </Link>
        <p className="mt-4 truncate px-2 text-sm text-white/70">{user.name} · Platform</p>
        <nav aria-label="Platform" className="mt-4 space-y-1">
          <NavLinks links={LINKS} />
        </nav>
        <div className="mt-auto px-2 pt-6">
          <LogoutButton variant="onBrand" className="w-full" />
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-6">{children}</main>
    </div>
  );
}
