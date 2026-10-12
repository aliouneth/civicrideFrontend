import type { SelectHTMLAttributes } from "react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, id, className = "", children, ...rest }: Props) {
  const fieldId = id ?? rest.name;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      <select
        {...rest}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className="min-h-[44px] w-full rounded-lg border border-line bg-card px-3 py-2 text-base"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        {children}
      </select>
      {error && <p id={`${fieldId}-error`} role="alert" className="mt-1 text-sm font-medium text-bad-fg">{error}</p>}
    </div>
  );
}
