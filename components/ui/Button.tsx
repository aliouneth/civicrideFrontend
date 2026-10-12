import type { ComponentPropsWithRef } from "react";

interface Props extends ComponentPropsWithRef<"button"> {
  variant?: "primary" | "accent" | "ghost" | "onBrand" | "danger" | "dangerOutline";
  loading?: boolean;
}

// Min-height 44px touch target; loading state disables + announces via aria-busy.
export function Button({ variant = "primary", loading, className = "", children, ...rest }: Props) {
  const styles = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    accent: "bg-accent-600 text-white hover:bg-accent-700",
    ghost: "border border-line bg-card text-ink-900 hover:bg-paper",
    // For the navy brand field — a variant, not ghost plus colour overrides,
    // which would collide with ghost's own text/bg utilities.
    onBrand: "border border-white/25 bg-white/10 text-white hover:bg-white/20",
    danger: "bg-bad-fg text-white hover:brightness-110",
    // Destructive but not primary: white fill, red border and red label
    // (6.9:1 on white, 5.9:1 on the hover tint).
    dangerOutline: "border border-bad-fg bg-card text-bad-fg hover:bg-bad-bg",
  }[variant];

  return (
    <button
      {...rest}
      suppressHydrationWarning
      disabled={rest.disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-base font-semibold transition-colors duration-200 ease-out active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
    >
      {loading && (
        <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
}
