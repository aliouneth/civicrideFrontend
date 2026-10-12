import { Spinner } from "@/components/ui/Spinner";

// Route-level skeleton fallback: fixed heights reserve space (CLS < 0.1).
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl p-6" role="status" aria-label="Loading">
      <div className="mb-4 h-8 w-48 animate-pulse rounded bg-line" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl border border-line bg-card" />
        ))}
      </div>
      <Spinner className="mt-6" />
    </div>
  );
}
