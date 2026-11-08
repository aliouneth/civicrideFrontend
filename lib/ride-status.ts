// Status presentation metadata: label + icon + classes TOGETHER.
// Status is never conveyed by color alone (design system §2).
export interface StatusMeta {
  label: string;
  classes: string; // badge bg/text/border
  dot: string;     // live-dot color for realtime lists (always paired with label)
}

export const RIDE_STATUS_META: Record<string, StatusMeta> = {
  pending:   { label: "Pending",   classes: "bg-warn-bg text-warn-fg border-warn-fg/25", dot: "bg-warn-fg" },
  assigned:  { label: "Assigned",  classes: "bg-info-bg text-info-fg border-info-fg/25", dot: "bg-info-fg" },
  en_route:     { label: "En route",     classes: "bg-route-bg text-route-fg border-route-fg/25", dot: "bg-route-fg" },
  at_pickup:    { label: "At pickup",    classes: "bg-aboard-bg text-aboard-fg border-aboard-fg/25", dot: "bg-aboard-fg" },
  transporting: { label: "Transporting", classes: "bg-aboard-bg text-aboard-fg border-aboard-fg/25", dot: "bg-aboard-fg" },
  completed: { label: "Completed", classes: "bg-ok-bg text-ok-fg border-ok-fg/25", dot: "bg-ok-fg" },
  cancelled: { label: "Cancelled", classes: "bg-bad-bg text-bad-fg border-bad-fg/25", dot: "bg-bad-fg" },
};

export function statusMeta(code: string): StatusMeta {
  return RIDE_STATUS_META[code] ?? { label: code, classes: "bg-paper text-ink-500 border-line", dot: "bg-ink-500" };
}

/** Next legal actions for the driver execution UI, derived from the lifecycle graph. */
export function nextDriverActions(code: string): { to: string; label: string; primary?: boolean }[] {
  switch (code) {
    case "assigned":     return [{ to: "en_route", label: "Start Ride", primary: true }];
    case "en_route":     return [{ to: "at_pickup", label: "At Pickup", primary: true }];
    case "at_pickup":    return [{ to: "transporting", label: "Start Transporting", primary: true }];
    case "transporting": return [{ to: "completed", label: "End Ride", primary: true }];
    default:             return [];
  }
}

/** Previous step for the driver execution UI (Back button), or null when none. */
export function previousDriverAction(code: string): { to: string; label: string } | null {
  switch (code) {
    case "en_route":     return { to: "assigned", label: "Back" };
    case "at_pickup":    return { to: "en_route", label: "Back" };
    case "transporting": return { to: "at_pickup", label: "Back" };
    default:             return null;
  }
}
