"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type ViewMode = "grouped" | "table" | "calendar";

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: "grouped", label: "Grouped", icon: <span className="text-[12px]">≡</span> },
  { value: "table", label: "Table", icon: <span className="text-[12px]">▤</span> },
  { value: "calendar", label: "Calendar", icon: <span className="text-[12px]">▣</span> },
];

export function ViewModePicker({ value }: { value: ViewMode }) {
  const router = useRouter();
  const params = useSearchParams();

  const choose = useCallback((next: ViewMode) => {
    const q = new URLSearchParams(params.toString());
    q.set("view", next);
    router.push(`/dashboard?${q.toString()}`);
  }, [params, router]);

  return (
    <div role="group" aria-label="View mode" className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-ink-500">View</span>
      <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-card p-1">
        {VIEW_OPTIONS.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => choose(o.value)}
              aria-pressed={active}
              className={`min-h-[36px] rounded-md px-3 text-sm font-semibold transition-colors duration-200 ease-out flex items-center gap-1.5 ${
                active
                  ? "bg-brand-600 text-white"
                  : "text-ink-500 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {o.icon} {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}