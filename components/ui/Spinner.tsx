export function Spinner({ className = "", label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={`inline-flex items-center gap-2 text-ink-500 ${className}`}>
      <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-brand-600" />
      {label}
    </span>
  );
}
