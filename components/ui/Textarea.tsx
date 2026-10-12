import type { TextareaHTMLAttributes } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Textarea({ label, error, id, className = "", ...rest }: Props) {
  const fieldId = id ?? rest.name;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      <textarea
        {...rest}
        id={fieldId}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className="w-full rounded-lg border border-line bg-card px-3 py-2 text-base"
      />
      {error && <p id={`${fieldId}-error`} role="alert" className="mt-1 text-sm font-medium text-bad-fg">{error}</p>}
    </div>
  );
}
