"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { BoardGrouping } from "@/lib/api";

const OPTIONS: { value: BoardGrouping; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "series", label: "Series" },
  { value: "passenger", label: "Passenger" },
  { value: "driver", label: "Driver" },
];

// Grouping lives in the URL so the view is shareable and survives a refresh.
export function GroupByPicker({ value }: { value: BoardGrouping }) {
  const router = useRouter();
  const params = useSearchParams();

  const choose = useCallback((next: BoardGrouping) => {
    const q = new URLSearchParams(params.toString());
    q.set("by", next);
    router.push(`/dashboard?${q.toString()}`);
  }, [params, router]);

  return (
    <div role="group" aria-label="Group the board by" className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-ink-500">Group by</span>
      <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-card p-1">
        {OPTIONS.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => choose(o.value)}
              aria-pressed={active}
              className={`min-h-[36px] rounded-md px-3 text-sm font-semibold transition-colors duration-200 ease-out ${
                active
                  ? "bg-brand-600 text-white"
                  : "text-ink-500 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}