import { statusMeta } from "@/lib/ride-status";
import { Badge } from "@/components/ui/Badge";

// Icon + text + color together — never color alone.
export function StatusBadge({ code }: { code: string }) {
  const meta = statusMeta(code);
  return (
    <Badge className={meta.classes}>
      <span aria-hidden className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </Badge>
  );
}
