import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";

export const metadata: Metadata = { title: "How It Works" };

const sections = [
  { id: "agency-setup", label: "1. Agency onboarding" },
  { id: "ride-scheduling", label: "2. Ride scheduling" },
  { id: "driver-assignment", label: "3. Driver assignment" },
  { id: "ride-execution", label: "4. Ride execution" },
  { id: "reporting", label: "5. Reporting and analytics" },
];

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            How It Works
          </h1>
          <p className="mt-3 text-sm text-ink-500">Last updated: November 24, 2026</p>

          <p className="mt-6 text-lg text-ink-500">
            CivicRide is a multi-tenant ride coordination platform designed for
            transit agencies and mobility providers. This page outlines the
            typical workflow for agencies, staff, and drivers.
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

          <section id="agency-setup" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">1. Agency onboarding</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Agencies sign up for a CivicRide workspace. An administrator creates
              the agency account and invites staff members (supervisors, schedulers,
              drivers) via email invitations. Each user accepts the invitation and
              sets up their credentials. The administrator defines roles and
              permissions within the workspace.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Once onboarding is complete, the agency can begin entering ride
              requests and assigning drivers.
            </p>
          </section>

          <section id="ride-scheduling" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">2. Ride scheduling</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Agency staff create ride requests through the web interface or API.
              For each ride, they specify: passenger names and contact
              information, pickup and dropoff addresses, scheduled times, party
              size, and any accessibility needs (wheelchair, child seat, etc.).
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Rides can be one-way or roundtrip. Agencies can also create
              recurring series (e.g., "daily school runs") and set driver
              assignments at the series level. All ride data is stored securely
              and isolated per agency workspace.
            </p>
          </section>

          <section id="driver-assignment" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">3. Driver assignment</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              When a ride is created, available drivers in the agency's workspace
              are notified. Drivers can view ride details and accept or decline
              assignments. The system considers driver availability, location,
              vehicle capacity, and special requirements (e.g., wheelchair
              accessibility) when suggesting assignments.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Drivers receive assignments through the driver mobile app, which
              shows: ride details, passenger pickup/dropoff locations, special
              instructions, and navigation. Drivers confirm arrival and completion
              of each ride through the app.
            </p>
          </section>

          <section id="ride-execution" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">4. Ride execution</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              During the ride, drivers follow the planned route and provide
              transportation per the scheduled times. The platform tracks ride
              status in real time: "requested," "assigned," "en route," "picked
              up," "completed," and "cancelled." Any changes (delays, route
              changes) are communicated through the app to the agency and/or
              passenger.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              After each ride, drivers complete a short execution summary,
              including actual pickup/dropoff times, mileage, and any notes.
              This data feeds into the reporting and analytics module.
            </p>
          </section>

          <section id="reporting" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">5. Reporting and analytics</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Agency administrators have access to dashboards and reports that
              show: total rides completed, on-time performance, driver
              performance metrics, route efficiency, and passenger feedback.
              Reports can be exported for further analysis or compliance purposes.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              The dispatch board view (agency-dashboard) provides a real-time
              snapshot of all active and upcoming rides, grouped by status,
              driver, or series. Filters allow narrowing by date range, ride
              type, or status (pending, assigned, completed, cancelled).
            </p>
          </section>

          <p className="mt-6 text-lg text-ink-500 leading-relaxed">
            This is a high-level overview. Each step has additional configuration
            options, permissions, and integration points with external systems
            (GPS, payment platforms, third-party dispatch tools). For detailed
            technical documentation, visit the <Link href="/soc2-report" className="text-brand-600 hover:underline">
              SOC 2 Report
            </Link> or contact <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
              contact@civicride.com
            </a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}