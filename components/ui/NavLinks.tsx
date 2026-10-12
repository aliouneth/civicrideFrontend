"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavLink {
  href: string;
  label: string;
  icon?: string;
}

// Colour classes must be mutually exclusive: Tailwind resolves equal-specificity
// conflicts by stylesheet order, not by class-attribute order, so concatenating a
// base string with an active string silently loses one of them. Pick the whole
// colour set instead of layering it.
const LAYOUT = "rounded-lg px-3 py-2 font-semibold transition-colors duration-200 ease-out";

// Sidebar sits on the navy brand field, tabs sit on a white bar.
const VARIANTS = {
  sidebar: {
    idle: "block text-white/75 hover:bg-white/10 hover:text-white",
    active: "block bg-white text-brand-800 hover:bg-white hover:text-brand-900",
  },
  tabs: {
    idle: "inline-flex min-h-[44px] items-center whitespace-nowrap text-sm text-ink-500 hover:bg-brand-50 hover:text-brand-700",
    active: "inline-flex min-h-[44px] items-center whitespace-nowrap text-sm bg-brand-50 text-brand-800 hover:bg-brand-100 hover:text-brand-900",
  },
} as const;

export function NavLinks({ links, variant = "sidebar" }: { links: NavLink[]; variant?: keyof typeof VARIANTS }) {
  const pathname = usePathname();
  const styles = VARIANTS[variant];

  return (
    <>
      {links.map((l) => {
        // Exact match, or the item is an ancestor route ("/rides/series" stays lit
        // on "/rides/series/01M4…"). The "/"-guard stops /rides/new from
        // matching an unrelated /rides/newer/... path.
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`${LAYOUT} ${active ? styles.active : styles.idle}`}
          >
            {l.icon && <span aria-hidden className="mr-2 leading-none">{l.icon}</span>}
            {l.label}
          </Link>
        );
      })}
    </>
  );
}