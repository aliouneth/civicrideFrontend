"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface InboxNotification {
  id: number;
  type: string;
  data: {
    ride_id?: number;
    passenger_name?: string;
    pickup_address?: string;
    scheduled_pickup_at?: string;
    rejected_by?: string;
    reason?: string;
  };
  read_at: string | null;
  created_at: string;
}

interface InboxResponse {
  data: InboxNotification[];
  unread_count: number;
}

const POLL_MS = 15_000;

/** Human copy for a notification row; unknown types fall back to the raw type. */
function describe(notification: InboxNotification): { title: string; body: string; href: string | null } {
  const { data } = notification;

  if (notification.type === "ride.unassigned" && data.ride_id) {
    const passenger = data.passenger_name ?? "a passenger";
    return {
      title: `Ride #${data.ride_id} needs a driver`,
      body: `${data.rejected_by ?? "The driver"} rejected the assignment for ${passenger}. It is back on the dispatch board.`,
      href: `/rides/${data.ride_id}/assign`,
    };
  }

  if (notification.type === "ride.assigned" && data.ride_id) {
    return {
      title: `Ride #${data.ride_id} assigned`,
      body: data.pickup_address ? `Pickup at ${data.pickup_address}.` : "A new ride was assigned.",
      href: `/rides/${data.ride_id}/assign`,
    };
  }

  return {
    title: "Notification",
    body: notification.type,
    href: data.ride_id ? `/rides/${data.ride_id}/assign` : null,
  };
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Agency inbox bell. Polls the personal notification feed, shows an unread
 * count, and is the active alert for driver rejections (which return a ride to
 * the board). Drivers have their own execution screens and do not render this.
 */
export function NotificationBell({
  onBrand = false,
  align = "right",
}: {
  onBrand?: boolean;
  align?: "left" | "right";
}) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InboxNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=20", { cache: "no-store" });
      if (!response.ok) return;
      const body = (await response.json()) as InboxResponse;
      setItems(body.data ?? []);
      setUnreadCount(body.unread_count ?? 0);
      setLoaded(true);
    } catch {
      // Network blips are expected while polling; keep the last known state.
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [load]);

  // Dismiss the panel on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
    setUnreadCount(0);
    await fetch("/api/notifications/read-all", { method: "POST" }).catch(() => {});
    void load();
  }

  async function openNotification(notification: InboxNotification) {
    setOpen(false);

    if (!notification.read_at) {
      setItems((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      await fetch(`/api/notifications/${notification.id}/read`, { method: "POST" }).catch(() => {});
    }

    const { href } = describe(notification);
    if (href) {
      router.push(href);
      router.refresh();
    }
  }

  const buttonClasses = onBrand
    ? "text-white/80 hover:bg-white/10 hover:text-white"
    : "text-ink-500 hover:bg-paper hover:text-ink-900";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-haspopup="true"
        aria-expanded={open}
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-200 ease-out ${buttonClasses}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute right-1 top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-[11px] font-bold leading-5 text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-card shadow-xl ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <p className="text-sm font-semibold text-ink-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {loaded && items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-ink-500">You have no notifications yet.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-line overflow-y-auto">
              {items.map((notification) => {
                const { title, body } = describe(notification);
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={`flex w-full flex-col gap-1 px-3 py-3 text-left transition-colors hover:bg-paper ${
                        notification.read_at ? "bg-card" : "bg-brand-50"
                      }`}
                    >
                      <span className="flex items-start gap-2">
                        {!notification.read_at && (
                          <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-600" />
                        )}
                        <span className="text-sm font-semibold text-ink-900">{title}</span>
                      </span>
                      <span className="text-xs text-ink-500">{body}</span>
                      <span className="text-[11px] text-ink-500/80">{formatWhen(notification.created_at)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
