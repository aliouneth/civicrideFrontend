"use client";

import type { InputHTMLAttributes } from "react";

// Styled checkbox with accessible label. Use with <label> or pass children.
export function Checkbox({ label, id, className = "", children, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string; children?: React.ReactNode }) {
  const fieldId = id ?? rest.name;

  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        id={fieldId}
        className="h-4 w-4 rounded border-line bg-card text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
        {...rest}
      />
      {label && <span className="text-sm text-ink-900">{label}</span>}
      {children}
    </label>
  );
}