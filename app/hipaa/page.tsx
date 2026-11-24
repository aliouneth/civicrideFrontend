import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";

export const metadata: Metadata = { title: "HIPAA Compliance" };

const sections = [
  { id: "scope", label: "1. Scope and applicability" },
  { id: "safeguards", label: "2. Administrative safeguards" },
  { id: "technical", label: "3. Technical safeguards" },
  { id: "physical", label: "4. Physical safeguards" },
  { id: "policies", label: "5. Policies and procedures" },
  { id: "business", label: "5. Business Associate Agreement" },
  { id: "rights", label: "6. Patient rights" },
  { id: "complaints", label: "7. Complaints" },
];

export default function HIPAAPage() {
  return (
    <>
      <Header />
      <main className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            HIPAA Compliance
          </h1>
          <p className="mt-3 text-sm text-ink-500">Last updated: November 24, 2026</p>

          <p className="mt-6 text-lg text-ink-500">
            CivicRide, Inc. ("CivicRide") provides a cloud-based ride coordination
            platform for transit agencies and mobility providers. While CivicRide
            is not a covered entity under HIPAA, we implement safeguards that
            align with the Health Insurance Portability and Accountability Act
            (HIPAA) Security Rule to protect electronic protected health
            information (ePHI) that agencies may input into the Service.
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

          <section id="scope" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">1. Scope and applicability</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRide is a business-to-business platform. Transit agencies and
              mobility providers ("agencies") use CivicRide to schedule and dispatch
              rides. CivicRide is not a covered entity under the Health Insurance
              Portability and Accountability Act (HIPAA). However, agencies may
              input ePHI into the Service for trip coordination, and CivicRide
              processes that information as a service provider on the agency's
              behalf.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              This page describes the safeguards CivicRide implements when
              handling ePHI on behalf of its agency customers.
            </p>
          </section>

          <section id="safeguards" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">2. Administrative safeguards</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRide implements the following administrative safeguards required
              under the HIPAA Security Rule:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Risk analysis and management.
                </span>
                Regular assessment of potential risks to ePHI confidentiality,
                integrity, and availability.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Risk management.
                </span>
                Implementation of security measures sufficient to reduce risks
                to ePHI to a reasonable and appropriate level.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Sanction policy.
                </span>
                Application of disciplinary actions to workforce members who
                violate HIPAA policies or security procedures.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Workforce training and management.
                </span>
                Regular security awareness training for all team members who
                handle ePHI.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Contingency plan.
                </span>
                Data backup and disaster recovery procedures to ensure ePHI
                availability during emergencies.
              </li>
            </ul>
          </section>

          <section id="technical" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">3. Technical safeguards</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRite implements the following technical safeguards:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Access control.
                </span>
                Unique user identifiers, emergency access procedure, and
                automatic logoff.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Audit controls.
                </span>
                Append-only audit trail of security-relevant actions per agency,
                including login success/failure, report exports, and account
                changes.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Integrity control.
                </span>
                Measures to confirm that ePHI has not been altered or destroyed
                in an unauthorized manner.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Person or entity authentication.
                </span>
                Multi-factor authentication for administrator accounts; strong
                password policy (minimum length with letters and numbers).
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Transmission security.
                </span>
                All ePHI is transmitted over HTTPS. At rest, ePHI is stored in
                encrypted databases with access restricted to authorized agency
                users and CivicRide service providers under contract.
              </li>
            </ul>
          </section>

          <section id="physical" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">4. Physical safeguards</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRite implements the following physical safeguards:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Facility access controls.
                </span>
                Physical server rooms with limited access, surveillance
                cameras, and intrusion detection.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Workstation use.
                </span>
                Policies governing workstation access and use of devices that
                access ePHI.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Device and media controls.
                </span>
                Procedures for the disposal, reuse, and tracking of devices
                that have stored ePHI.
              </li>
            </ul>
          </section>

          <section id="policies" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">5. Policies and procedures</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRite maintains documented policies and procedures to comply
              with the HIPAA Security Rule, including but not limited to:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Security policy.
                </span>
                Overarching information security program.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Privacy policy.
                </span>
                How CivicRite handles personal information.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Breach notification policy.
                </span>
                Procedures for identifying and notifying agencies of breaches
                of unsecured ePHI.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Retention and disposal policy.
                </span>
                Guidelines for how long ePHI is retained and secure disposal
                when no longer needed.
              </li>
            </ul>
          </section>

          <section id="business" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">5. Business Associate Agreement</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRite enters into a Business Associate Agreement (BAA) with
              each agency that uses the Service and may handle ePHI. The BAA
              establishes the roles and responsibilities of each party regarding
              ePHI protection, breach notification, and other HIPAA-required
              matters. Agencies can request a copy of the BAA by contacting
              CivicRite at <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
                contact@civicride.com
              </a>.
            </p>
          </section>

          <section id="rights" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">6. Patient rights</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Because CivicRite is not a covered entity, direct patient rights
              under HIPAA (such as access, amendment, or accounting of
              disclosures) are exercised by the agency that input the ePHI.
              Agencies should refer to their internal policies and the HIPAA
              regulations to fulfill patient requests. CivicRite will assist
              agencies in exporting or transmitting ePHI data when legally
              required or as authorized by the agency.
            </p>
          </section>

          <section id="complaints" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">7. Complaints</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              If an agency believes CivicRite has violated HIPAA safeguards or
              the terms of the BAA, the agency should contact us immediately
              at <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
                contact@civicride.com
              </a>. Agencies also have the right to file a complaint with the
              U.S. Department of Health and Human Services (HHS) Office for
              Civil Rights at <a href="https://www.hhs.gov/hipaa/for-professionals/guidance-enforcement/" className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">
                https://www.hhs.gov/hipaa/for-professionals/guidance-enforcement/
              </a>.
            </p>
          </section>

          <p className="mt-6 text-lg text-ink-500 leading-relaxed">
            For questions about CivicRite&apos;s HIPAA compliance program or
            to request a BAA, please contact us at <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
              contact@civicride.com
            </a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}