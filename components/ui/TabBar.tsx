"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "./NavLinks";

// Driver bottom nav: >=64px touch targets, icon + text label, deep-linkable.
// Active tab is marked by the crimson rule (logo accent) *and* aria-current —
// never by color alone.
export function TabBar({ tabs }: { tabs: NavLink[] }) {
  const pathname = usePathname();

  return (
    <ul className="mx-auto grid grid-cols-4">
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <li key={t.href}>
            <Link
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[64px] flex-col items-center justify-center gap-0.5 text-sm font-semibold transition-colors duration-200 ease-out ${
                active ? "text-brand-700" : "text-ink-500"
              }`}
            >
              <span aria-hidden className="text-lg leading-none">{t.icon}</span>
              {t.label}
              <span
                aria-hidden
                className={`mt-1 h-1 w-7 rounded-full ${active ? "bg-accent-600" : "bg-transparent"}`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}