"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { browserTimezone, normalizeTimezone, TIMEZONE_COOKIE } from "@/lib/timezone";

/**
 * Publishes the browser's zone as the cr_tz cookie, which server components
 * and the BFF read to compute "today"/"this month" and format times. On a
 * first visit (or after a trip) the servers rendered with the UTC fallback, so
 * refresh once the cookie is written.
 */
export function TimezoneSync({ current }: { current: string | null }) {
  const router = useRouter();

  useEffect(() => {
    const zone = normalizeTimezone(browserTimezone());
    if (!zone || zone === current) return;

    // IANA ids are cookie-safe as-is (letters, "/", "_", "+", "-"): no encoding,
    // so server readers never see an escaped slash.
    document.cookie = `${TIMEZONE_COOKIE}=${zone}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [current, router]);

  return null;
}
