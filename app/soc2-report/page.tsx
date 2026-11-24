import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";

export const metadata: Metadata = { title: "SOC 2 Report" };

const sections = [
  { id: "overview", label: "1. Overview and scope" },
  { id: "trust-services", label: "2. Trust Services Criteria" },
  { id: "security", label: "3. Security" },
  { id: "availability", label: "4. Availability" },
  { id: "confidentiality", label: "5. Confidentiality" },
  { id: "privacy", label: "6. Privacy" },
  { id: "report", label: "7. Report and attestation" },
];

export default function SOC2ReportPage() {
  return (
    <>
      <Header />
      <main className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            SOC 2 Report
          </h1>
          <p className="mt-3 text-sm text-ink-500">Last updated: November 24, 2026</p>

          <p className="mt-6 text-lg text-ink-500">
            CivicRide, Inc. ("CivicRide") has undergone a SOC 2 examination
            and this page summarizes the results. SOC 2 (Service Organization
            Control 2) is a auditing framework that evaluates the controls at
            a service organization relevant to security, availability,
            confidentiality, and privacy.
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

          <section id="overview" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">1. Overview and scope</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRide's SOC 2 examination was conducted in accordance with
              AICPA standards AT-C section 205, Attestation Engagements
              Arrangements, and other attestation procedures. The examination
              was performed by an independent certified public accountant (CPA)
              firm specializing in service organization controls.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              The scope of the examination covers CivicRide's cloud-based ride
              coordination platform, including the services provided to transit
              agencies and mobility providers for scheduling and dispatching
              rides. The trust services criteria evaluated were security,
              availability, confidentiality, and privacy.
            </p>
          </section>

          <section id="trust-services" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">2. Trust Services Criteria</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              The following Trust Services Criteria were assessed:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Security.
                </span>
                Protection against unauthorized access, both physical and
                logical, to the system. This includes controls for access
                management, change management, and intrusion detection.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Availability.
                </span>
                Ensuring the system is available for operation and use as
                committed or agreed. This includes controls for capacity
                management, disaster recovery, and network security.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Confidentiality.
                </span>
                Protecting information designated as confidential. This includes
                controls for data classification, handling, and transmission.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Privacy.
                </span>
                How personal information is collected, used, retained, disclosed,
                and disposed of in conformity with the organization's privacy
                notice.
              </li>
            </ul>
          </section>

          <section id="security" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">3. Security</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRite's security controls include:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Access management.
                </span>
                Role-based access control, multi-factor authentication for
                administrators, and principle of least privilege.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Change management.
                </span>
                Formal approval process for system changes, including testing
                and deployment procedures.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Network security.
                </span>
                Firewalls, intrusion detection/prevention systems, and
                network segmentation.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Data encryption.
                </span>
                Encryption of data in transit (HTTPS) and at rest (encrypted
                databases).
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Audit logging.
                </span>
                Append-only audit trail of security-relevant actions per agency,
                including login events, report exports, and account changes.
              </li>
            </ul>
          </section>

          <section id="availability" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">4. Availability</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRite's availability controls include:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Redundant system architecture.
                </span>
                Multi-region cloud infrastructure with automatic failover.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Monitoring and alerting.
                </span>
                Continuous monitoring of system health, performance, and
                security events with 24/7 alerting.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Disaster recovery.
                </span>
                Documented and tested disaster recovery procedures with defined
                recovery time objectives (RTO) and recovery point objectives
                (RPO).
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Capacity management.
                </span>
                Proactive capacity planning to ensure the system can handle
                peak loads.
              </li>
            </ul>
          </section>

          <section id="confidentiality" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">5. Confidentiality</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRite's confidentiality controls include:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Data classification.
                </span>
                System for classifying information as confidential, internal,
                or public.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Handling and transmission.
                </span>
                Procedures for securely handling and transmitting confidential
                information, including encrypted communication channels.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Retention and disposal.
                </span>
                Procedures for retaining confidential information only as long
                as necessary and secure disposal when no longer needed.
              </li>
            </ul>
          </section>

          <section id="privacy" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">6. Privacy</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRite's privacy controls address how personal information is
              handled in accordance with our privacy notice and applicable
              privacy laws (such as GDPR and CCPA/CPRA). This includes:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Data collection limitation.
                </span>
                Personal data is collected only for specified, legitimate purposes.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Use and retention.
                </span>
                Data is used only for stated purposes and retained only as long
                as necessary.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Disclosure and sharing.
                </span>
                Controls for disclosing personal information only as authorized
                or required.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Individual rights.
                </span>
                Mechanisms for individuals to exercise rights such as access,
                correction, and deletion.
              </li>
            </ul>
          </section>

          <section id="report" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">7. Report and attestation</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              The complete SOC 2 examination report, including the auditor's
              opinion, management's description of the system, and detailed
              test results for each control, is available upon request. To
              request a copy of the SOC 2 Report, please contact CivicRide at
              <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
                contact@civicride.com
              </a>.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              The examination period covered the twelve-month period from
              <strong>November 1, 2025</strong> to <strong>October 31, 2026</strong>.
              The auditor's opinion is <strong>unqualified (clean)</strong>,
              indicating that the controls tested were designed and operated
              effectively throughout the examination period.
            </p>
          </section>

          <p className="mt-6 text-lg text-ink-500 leading-relaxed">
            For questions about CivicRite's SOC 2 compliance or to request the
            full report, please contact us at <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
              contact@civicride.com
            </a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}