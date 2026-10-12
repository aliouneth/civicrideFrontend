import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

// Shared chrome for /login and /register: the real wordmark lockup reads
// correctly on light, so it goes on white — never on the navy brand field.
// `title` is optional: without it the subtitle is promoted to the <h1> so the
// page always keeps exactly one top-level heading for screen-reader navigation.
export function AuthHeader({
  title,
  subtitle,
}: {
  title?: string;
  subtitle: string;
}) {
  return (
    <header className="text-center">
      {/* Preflight makes <img> display:block, so text-center cannot centre the
          lockup — centre it with flex instead. */}
      <div className="flex justify-center">
        <Logo height={56} priority />
      </div>
      {title ? (
        <>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-brand-900">{title}</h1>
          <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
        </>
      ) : (
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-brand-900">{subtitle}</h1>
      )}
    </header>
  );
}

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title?: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6">
      <AuthHeader title={title} subtitle={subtitle} />
      <div className="mt-6 rounded-xl border border-line bg-card p-6 shadow-sm">{children}</div>
      <p className="mt-4 text-center text-sm text-ink-500">{footer}</p>
    </main>
  );
}

export function AuthFooterLink({ prefix, href, linkLabel }: { prefix: string; href: string; linkLabel: string }) {
  return (
    <>
      {prefix}{" "}
      <Link href={href} className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2 hover:decoration-brand-700">
        {linkLabel}
      </Link>
    </>
  );
}