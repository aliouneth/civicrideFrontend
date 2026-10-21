import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative bg-white pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-600 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600" />
            </span>
            <span>Now serving 50+ agencies nationwide</span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl leading-tight">
            Smarter Rides. <span className="text-brand-600">With You Along the Way.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg text-ink-500 max-w-2xl mx-auto sm:text-xl">
            AI-powered routing, real-time analytics, and seamless multi-modal scheduling —
            making rides planning and management more efficient, reliable, and sustainable for every community.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#contact">
              <Button variant="primary" className="w-full sm:w-auto min-w-[220px] py-3 px-6 text-lg">
                Get Started As Agency
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="ghost" className="w-full sm:w-auto min-w-[220px] py-3 px-6 text-lg">
                Get Started As Driver
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <ul
            className="mx-auto mt-16 grid max-w-3xl grid-cols-1 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0"
            aria-label="Compliance and reliability"
          >
            <li className="flex items-center gap-3 px-5 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-paper text-brand-700" aria-hidden="true">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 4.4-3 8.3-7 9-4-.7-7-4.6-7-9V7l7-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">SOC 2 Type II</p>
                <p className="text-xs text-ink-500">Certified</p>
              </div>
            </li>
            <li className="flex items-center gap-3 px-5 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-paper text-brand-700" aria-hidden="true">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3.5l2.5 6 4.5-12 2.5 6H21" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">99.9% Uptime</p>
                <p className="text-xs text-ink-500">Service level agreement</p>
              </div>
            </li>
            <li className="flex items-center gap-3 px-5 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-paper text-brand-700" aria-hidden="true">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10V7a4 4 0 118 0v3" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">HIPAA</p>
                <p className="text-xs text-ink-500">Compliant</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
