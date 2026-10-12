import Link from "next/link";
import { Button } from "./Button";

// Empty states explain WHY there is no data + the ONE action that fixes it.
export function EmptyState({ title, body, actionHref, actionLabel }: {
  title: string; body: string; actionHref?: string; actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-card p-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">{body}</p>
      {actionHref && (
        <Link href={actionHref} className="mt-4 inline-block">
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
