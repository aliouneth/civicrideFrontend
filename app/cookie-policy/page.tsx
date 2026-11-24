import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";

export const metadata: Metadata = { title: "Cookie Policy" };

const sections = [
  { id: "essential", label: "1. Essential cookies" },
  { id: "bot-protection", label: "2. Bot protection cookies" },
  { id: "performance", label: "3. Performance and analytics" },
  { id: "manage", label: "4. Managing cookies" },
];

export default function CookiePage() {
  return (
    <>
      <Header />
      <main className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Cookie Policy
          </h1>
          <p className="mt-3 text-sm text-ink-500">Last updated: November 24, 2026</p>

          <p className="mt-6 text-lg text-ink-500">
            CivicRide, Inc. ("CivicRide," "we," "us," or
            "our") uses cookies and similar tracking technologies to
            operate the CivicRide ride coordination platform, improve your
            experience, and understand how the Service is used. This Cookie
            Policy explains what these technologies are, why we use them, and
            your choices.
          </p>

          <nav aria-label="Table of contents" className="mt-8 rounded-xl border border-line bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
              On this page
            </h2>
            <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-brand-600 hover:underline decoration-brand-300 underline-offset-2"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section id="essential" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">1. Essential cookies</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              We use strictly necessary cookies to keep you signed in. When you
              log in, we set an HTTP-only session cookie that stores a reference
              to your session; it cannot be read by client-side JavaScript, is
              marked Secure in production, and expires after 7 days. Without it,
              authenticated features of the Service would not work.
            </p>
          </section>

          <section id="bot-protection" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">2. Bot protection cookies</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Registration and login forms may include a bot-protection check
              (Cloudflare Turnstile) that processes technical data to verify that
              a human is submitting the form.
            </p>
          </section>

          <section id="performance" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">3. Performance and analytics</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              We do not use advertising or cross-site tracking cookies. Any
              analytics data we collect is aggregated and used solely to improve
              the Service.
            </p>
          </section>

          <section id="manage" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">4. Managing cookies</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              You can delete or block cookies in your browser settings. The
              session cookie will simply sign you out when removed. Because the
              Service requires the essential cookie to function, blocking it will
              prevent you from using authenticated features.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              You can also choose to opt out of our bot-protection check by
              adjusting your browser's privacy settings, though this may result
              in increased spam on registration forms.
            </p>
          </section>

          <p className="mt-6 text-lg text-ink-500 leading-relaxed">
            For more information about your rights and choices, please refer to
            our <Link href="/privacy" className="text-brand-600 hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}