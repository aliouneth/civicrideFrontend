import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { TabBar } from "@/components/ui/TabBar";
import type { NavLink } from "@/components/ui/NavLinks";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { DriverApprovalProvider } from "./_components/RequireApproved";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role.name !== "driver") redirect("/dashboard");

  const onboardingStatus = user.driver_profile?.onboarding_status ?? "applied";
  const isApproved = onboardingStatus === "approved";

  // Tabs for approved drivers
  const APPROVED_TABS: NavLink[] = [
    { href: "/driver", label: "Jobs", icon: "◉" },
    { href: "/driver/availability", label: "Shifts", icon: "◷" },
    { href: "/driver/reports", label: "Reports", icon: "▤" },
    { href: "/driver/account", label: "Account", icon: "⛉" },
  ];

  // Tabs for non-approved drivers - only Account
  const PENDING_TABS: NavLink[] = [
    { href: "/driver/account", label: "Account", icon: "⛉" },
  ];

  const tabs = isApproved ? APPROVED_TABS : PENDING_TABS;

  return (
    <DriverApprovalProvider isApproved={isApproved}>
      <div className="mx-auto min-h-dvh max-w-lg bg-paper pb-24">
        <header className="bg-brand-gradient px-4 pb-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/driver" className="flex items-center gap-2">
              <Logo variant="mark" height={28} plated priority />
              <span className="text-lg font-bold tracking-tight text-white">CivicRide</span>
            </Link>
            <div className="flex items-center gap-2">
              {isApproved && (
                <>
                  <Link
                    href="/driver"
                    className="flex min-h-[44px] items-center rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/25"
                  >
                    My Rides
                  </Link>
                  <Link
                    href="/driver?available=1"
                    className="flex min-h-[44px] items-center rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/25"
                  >
                    Available Rides
                  </Link>
                </>
              )}
              <LogoutButton variant="onBrand" className="min-h-[44px] rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/25" />
            </div>
          </div>
          <p className="mt-2 truncate text-sm text-white/80">
            Welcome {user.name}
            {user.driver_profile?.tenant?.name && ` · ${user.driver_profile.tenant.name}`}
          </p>
          {!isApproved && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <p className="font-medium">Registration pending approval</p>
              <p>Your registration is being reviewed. You can update your info and upload documents in the Account section.</p>
            </div>
          )}
        </header>

        <main className="p-4">{children}</main>

        <nav aria-label="Driver" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card">
          <TabBar tabs={tabs} />
        </nav>
      </div>
    </DriverApprovalProvider>
  );
}