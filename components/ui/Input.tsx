import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

// Visible label + inline error wired via aria-describedby (design system §6).
export function Input({ label, error, hint, id, className = "", ...rest }: Props) {
  const fieldId = id ?? rest.name;
  const describedBy = [error ? `${fieldId}-error` : null, hint ? `${fieldId}-hint` : null]
    .filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      <input
        {...rest}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="min-h-[44px] w-full rounded-lg border border-line bg-card px-3 py-2 text-base placeholder:text-ink-500/60"
        suppressHydrationWarning
      />
      {hint && !error && <p id={`${fieldId}-hint`} className="mt-1 text-sm text-ink-500">{hint}</p>}
      {error && <p id={`${fieldId}-error`} role="alert" className="mt-1 text-sm font-medium text-bad-fg">{error}</p>}
    </div>
  );
}
