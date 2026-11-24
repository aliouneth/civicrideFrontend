import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";

export const metadata: Metadata = { title: "Security" };

const sections = [
  { id: "overview", label: "1. Security overview" },
  { id: "measures", label: "2. Technical safeguards" },
  { id: "privacy", label: "3. Data privacy" },
  { id: "compliance", label: "4. Compliance certifications" },
  { id: "incident", label: "5. Incident response" },
];

export default function SecurityPage() {
  return (
    <>
      <Header />
      <main className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Security
          </h1>
          <p className="mt-3 text-sm text-ink-500">Last updated: November 24, 2026</p>

          <p className="mt-6 text-lg text-ink-500">
            CivicRide, Inc. ("CivicRide") is committed to protecting the security
            and confidentiality of all data processed through the CivicRide ride
            coordination platform. This page describes the security measures we
            implement, our approach to data privacy, and our compliance status.
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
            <h2 className="text-xl font-semibold text-ink-900">1. Security overview</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRide operates as a multi-tenant SaaS platform for transit
              agencies and mobility providers. Security is foundational to our
              product, as agencies entrust us with sensitive operational data
              including driver information, ride manifests, and passenger details.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Our security program is designed around the principle of least
              privilege, defense-in-depth, and tenant isolation. Every user,
              request, and data element is scoped to the requesting agency's
              workspace, and no cross-tenant data leakage is possible through
              the application layer.
            </p>
          </section>

          <section id="measures" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">2. Technical safeguards</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              The following technical safeguards are enforced at the application
              and infrastructure level:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Tenant isolation.
                </span>
                Every database query, API call, and file storage operation is
                automatically scoped to the requesting agency's `tenant_id`. The
                `BelongsToTenant` global scope and `ResolveTenant` middleware
                enforce this at the Laravel and Next.js layers.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Authentication and authorization.
                </span>
                Login is handled via Laravel Sanctum with httpOnly, Secure,
                SameSite cookies. API tokens expire after 30 days (configurable).
                Role-based permissions (`supervisor`, `admin`, `scheduler`,
                `driver`) are enforced at the route level. The `canDo()` method
                on the `User` model gates all server-side actions.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Audit logging.
                </span>
                An append-only `security_events` table records every login
                (success/failure), logout, registration, invite, account status
                change, report export, and platform admin action. Events are
                tenant-scoped; platform administrators can view the full trail.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Rate limiting.
                </span>
                Credential endpoints (`/api/auth/login`, `/api/auth/register`)
                are rate-limited to 10 attempts per email+IP per minute, and
                60 attempts per IP per minute. Registration is similarly
                throttled.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Password policy.
                </span>
                Minimum 10 characters with at least letters and numbers
                everywhere (registration, tenant creation, user creation).
                Weak passwords are rejected at the backend.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Transmission security.
                </span>
                All traffic is over HTTPS. The `secure` flag is set on all
                cookies in production. The `SameSite` attribute is enforced.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Encryption at rest.
                </span>
                MySQL data is encrypted via the hosting provider. Application
                secrets (`APP_KEY`) are encrypted and stored outside the codebase.
                S3-compatible storage for documents uses server-side encryption.
              </li>
            </ul>
          </section>

          <section id="privacy" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">3. Data privacy</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRide's data privacy approach aligns with the HIPAA Security
              Rule framework and applicable privacy laws (GDPR, CCPA/CPRA):
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Data minimization.
                </span>
                Only data necessary for the Service to function is collected.
                Form fields are validated and excess data is rejected.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Purpose limitation.
                </span>
                Data is used solely for the purposes disclosed at collection
                (ride scheduling, dispatch, execution, reporting).
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Retention.
                </span>
                Account and ride data are retained for as long as the agency
                maintains its workspace. When an agency closes its workspace,
                data is deleted or de-identified within a reasonable period,
                except where legal, security, or accounting requirements
                mandate longer retention. Security audit records are retained
                for the period needed to investigate activity and meet
                compliance obligations.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Individual rights.
                </span>
                Agencies can export or delete their data on request. Passengers
                should contact the agency that arranged their ride for data
                requests, as CivicRite processes data on the agency's behalf.
              </li>
            </ul>
          </section>

          <section id="compliance" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">4. Compliance certifications</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRide has undergone a SOC 2 examination and the results are
              summarized on our <Link href="/soc2-report" className="text-brand-600 hover:underline">
                SOC 2 Report page
              </Link>. The examination covered the Security Trust Services
              Criterion and other criteria as applicable to our service
              organization system.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              While CivicRite is not a covered entity under HIPAA, we implement
              safeguards that align with the HIPAA Security Rule (45 CFR
              §164.312) to protect ePHI that agencies may input into the
              Service. Details are available on our <Link href="/hipaa" className="text-brand-600 hover:underline">
                HIPAA Compliance page
              </Link>.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  SOC 2 Type II.
                </span>
                Independent CPA firm attestation (unqualified opinion),
                examination period Nov 1, 2025 – Oct 31, 2026.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  HIPAA-aligned technical safeguards.
                </span>
                Access control, audit logging, password policy, transmission
                security, and encryption at rest as described in this page.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Business Associate Agreements.
                </span>
                BAAs are offered to agencies that handle ePHI.
              </li>
            </ul>
          </section>

          <section id="incident" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">5. Incident response</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              If a security incident is detected, the following process is
              followed:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Detection.
                </span>
                Monitoring via audit logs, rate-limit triggers, and hosting
                provider alerts.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Containment.
                </span>
                Immediate actions to prevent further data exposure (e.g.,
                revoking compromised tokens, isolating affected tenant).
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Notification.
                </span>
                Affected agencies are notified without reasonable delay,
                consistent with legal and contractual obligations.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Remediation.
                </span>
                Root cause analysis, policy update, and control adjustment to
                prevent recurrence.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Reporting.
                </span>
                SOC 2 Type II examination includes incident reporting
                metrics; HIPAA breach notification follows HHS guidelines.
              </li>
            </ul>
            <p className="mt-4 text-ink-500 leading-relaxed">
              If you suspect a security issue or have questions about our
              incident response process, please contact us at
              <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
                contact@civicride.com
              </a>.
            </p>
          </section>

          <p className="mt-6 text-lg text-ink-500 leading-relaxed">
            For a complete overview of how we protect data, please also review
            our <Link href="/privacy" className="text-brand-600 hover:underline">
              Privacy Policy
            </Link> and <Link href="/hipaa" className="text-brand-600 hover:underline">
              HIPAA Compliance page
            </Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}