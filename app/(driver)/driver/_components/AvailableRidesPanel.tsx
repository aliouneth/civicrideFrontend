"use client";

import { useEffect, useState } from "react";

// Expand/collapse wrapper for the claimable-jobs list. The ride cards stay
// server-rendered (passed as children); only the accordion state is client-side.
export function AvailableRidesPanel({
  count,
  openByDefault = false,
  children,
}: {
  count: number;
  openByDefault?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(openByDefault);

  // Sync when the URL tells us to pre-open (e.g. the header "Available Rides"
  // button) after soft navigations, where the page may not remount.
  useEffect(() => {
    setOpen(openByDefault);
  }, [openByDefault]);

  return (
    <section className="mt-8">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-left font-semibold transition-colors hover:bg-ink-50"
      >
        <span>{open ? "Hide available rides" : "Available rides"}</span>
        <span className="flex items-center gap-2">
          <span className="tnum rounded-full bg-ink-100 px-2 py-0.5 text-sm font-bold">
            {count}
          </span>
          <span aria-hidden="true" className="text-ink-500">{open ? "▴" : "▾"}</span>
        </span>
      </button>
      {open && <div className="mt-3 space-y-4">{children}</div>}
    </section>
  );
}