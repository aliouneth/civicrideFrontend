import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections = [
  { id: "scope", label: "1. Scope and roles" },
  { id: "collect", label: "2. Information we collect" },
  { id: "use", label: "3. How we use information" },
  { id: "share", label: "4. How we disclose information" },
  { id: "cookies", label: "5. Cookies and session management" },
  { id: "retain", label: "6. Retention" },
  { id: "security", label: "7. Security" },
  { id: "rights", label: "8. Your rights and choices" },
  { id: "children", label: "9. Children" },
  { id: "transfers", label: "10. International transfers" },
  { id: "third-parties", label: "11. Third-party services" },
  { id: "changes", label: "12. Changes to this policy" },
  { id: "contact", label: "13. Contact" },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-ink-500">Last updated: November 4, 2026</p>

          <p className="mt-6 text-lg text-ink-500">
            This Privacy Policy explains how CivicRide, Inc.
            (&quot;CivicRide,&quot; &quot;we,&quot; &quot;us,&quot; or
            &quot;our&quot;) collects, uses, and shares information when you visit
            our website, use the CivicRide ride coordination platform, or
            communicate with us. It also describes the choices available to you.
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
            <h2 className="text-xl font-semibold text-ink-900">
              1. Scope and roles
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRide is a business-to-business platform. Transit agencies and
              mobility providers (&quot;agencies&quot;) use it to schedule and
              dispatch rides, and their staff and drivers use it to do that work.
              For the personal information of agency staff and drivers, CivicRide
              acts as a service provider processing information on the
              agency&apos;s behalf. For passenger information entered by an
              agency, the agency is the controller and CivicRide processes that
              information on the agency&apos;s instructions.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              If you are a passenger, questions about how your information is used
              for a specific trip should go to the agency that arranged your ride;
              we will assist your agency with requests we receive from them.
            </p>
          </section>

          <section id="collect" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              2. Information we collect
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              The information we collect depends on how you interact with the
              Service:
            </p>
            <ul className="mt-4 list-disc space-y-3 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Account information.
                </span>{" "}
                Name, email address, phone number, role within your agency
                (administrator, supervisor, scheduler, or driver), and a hashed
                password. Platform administrators additionally manage agency
                workspaces.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Driver profile information.
                </span>{" "}
                Driver&apos;s license number and expiration, vehicle make, model,
                year, color, plate and seating capacity, home address,
                availability schedule, onboarding status, and documents your
                agency asks you to upload (such as license or insurance images).
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Ride and dispatch information.
                </span>{" "}
                Passenger name and contact number, party size, accessibility
                needs (for example, wheelchair or child seat), pickup and dropoff
                addresses with coordinates, scheduled and actual trip times,
                assignment records, status changes, and operational notes.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Messages.
                </span>{" "}
                Content you send to other users through the in-app messaging
                feature.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Security and usage records.
                </span>{" "}
                IP address, login success and failure events, logout, account
                changes, report exports, and other security-relevant actions we
                record in an audit trail to protect accounts and investigate
                misuse.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Information you send us.
                </span>{" "}
                Details you include when you contact us through the website
                contact form or by email.
              </li>
            </ul>
          </section>

          <section id="use" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              3. How we use information
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>Provide, operate, and maintain the Service.</li>
              <li>
                Create and manage accounts, authenticate users, and enforce
                role-based permissions.
              </li>
              <li>
                Schedule, assign, execute, and document rides, and surface the
                information drivers need to complete them.
              </li>
              <li>
                Protect accounts and the platform: rate-limit credential
                attempts, maintain the security audit trail, and investigate
                suspicious activity.
              </li>
              <li>
                Provide support, respond to your requests, and send service
                notices (such as password resets or material policy changes).
              </li>
              <li>
                Improve the Service, including debugging and understanding
                aggregate usage.
              </li>
              <li>
                Comply with legal obligations and enforce our{" "}
                <Link href="/terms" className="text-brand-600 hover:underline">
                  Terms of Service
                </Link>
                .
              </li>
            </ul>
            <p className="mt-4 text-ink-500 leading-relaxed">
              We do not sell your personal information, and we do not use it for
              interest-based advertising.
            </p>
          </section>

          <section id="share" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              4. How we disclose information
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">
                  Within your agency.
                </span>{" "}
                Your role determines what colleagues can see. Administrators and
                supervisors can view their agency&apos;s drivers, rides, and
                reports; drivers see the rides assigned to them and their own
                profile.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Across agencies.
                </span>{" "}
                Each agency&apos;s data is isolated from other agencies. Only
                CivicRide platform administrators, who operate the service, can
                access data across agencies, and they do so for operation,
                support, and security purposes.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Service providers.
                </span>{" "}
                Hosting, infrastructure, and security vendors who process
                information on our behalf under contracts that limit its use to
                providing the Service.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Legal reasons.
                </span>{" "}
                When we believe in good faith that disclosure is required by law,
                or to protect the rights, safety, and property of CivicRide, our
                users, or the public.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Business transfers.
                </span>{" "}
                In connection with a merger, acquisition, or sale of assets, in
                which case we will notify you before your information becomes
                subject to a different privacy policy.
              </li>
            </ul>
          </section>

          <section id="cookies" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              5. Cookies and session management
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              We use strictly necessary cookies to keep you signed in. When you
              log in, we set an HTTP-only session cookie that stores a reference
              to your session; it cannot be read by client-side JavaScript, is
              marked Secure in production, and expires after 7 days. Without it,
              authenticated features of the Service would not work. We do not use
              advertising or cross-site tracking cookies.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Registration and login forms may include a bot-protection check
              (Cloudflare Turnstile) that processes technical data to verify that
              a human is submitting the form.
            </p>
          </section>

          <section id="retain" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">6. Retention</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              We keep account and ride information for as long as your agency
              maintains its workspace with us, because the Service is
              collaborative historical record for dispatch operations. When an
              agency closes its workspace, we delete or de-identify its data
              within a reasonable period, except where we are required to retain
              it longer for legal, security, or accounting reasons. Security audit
              records are retained for the period needed to investigate activity
              and meet compliance obligations. Retention settings are documented
              in our internal data retention schedule.
            </p>
          </section>

          <section id="security" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">7. Security</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              We maintain administrative, technical, and organizational measures
              designed to protect personal information, including per-agency data
              isolation, role-based access control, an append-only audit trail of
              security-relevant actions, rate limiting on credential endpoints, a
              minimum password standard with letters and numbers, expiring
              sessions and API tokens, HTTPS in transit, and encrypted storage of
              application secrets. These measures implement the technical
              safeguards mapped to the HIPAA Security Rule and the SOC 2
              Security criteria in our controls documentation.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              No method of transmission or storage is completely secure. If you
              believe your account has been compromised, contact us immediately at{" "}
              <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
                contact@civicride.com
              </a>
              .
            </p>
          </section>

          <section id="rights" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              8. Your rights and choices
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">Account profile.</span>{" "}
                Driver and staff users can review and update their profile
                information in the app.
              </li>
              <li>
                <span className="font-semibold text-ink-900">
                  Access, correction, or deletion.
                </span>{" "}
                Agency staff and drivers should direct requests to their agency
                administrator, who can act on the data in their workspace;
                administrators can contact us and we will assist. Passengers
                should contact the agency that arranged their ride.
              </li>
              <li>
                <span className="font-semibold text-ink-900">Marketing.</span>{" "}
                Service notices are part of the product; if we send promotional
                email, you can opt out using the link in it.
              </li>
              <li>
                <span className="font-semibold text-ink-900">Cookies.</span> You
                can delete cookies in your browser; the session cookie will simply
                sign you out.
              </li>
            </ul>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Depending on where you live, you may have additional rights under
              applicable privacy laws (such as the GDPR or CCPA/CPRA), including
              rights to access, delete, or obtain a copy of your personal
              information and to object to or restrict certain processing. We will
              honor such requests as required by law and will not discriminate
              against you for exercising them. To submit a request, contact us at{" "}
              <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
                contact@civicride.com
              </a>
              .
            </p>
          </section>

          <section id="children" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">9. Children</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              The Service is a business platform and is not directed to children
              under 13, and we do not knowingly collect personal information from
              them. Ride records may include the names of child passengers when
              an agency schedules a ride for them; that information is entered by
              the agency under its own responsibilities. If you believe a child
              has provided us information directly, contact us and we will delete
              it.
            </p>
          </section>

          <section id="transfers" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              10. International transfers
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRide is based in the United States and processes information in
              the United States. If you access the Service from outside the
              United States, your information will be transferred to the United
              States, where data protection laws may differ from those of your
              country. Where required, we use appropriate safeguards for such
              transfers.
            </p>
          </section>

          <section id="third-parties" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              11. Third-party services
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              The Service may link to third-party websites (for example, our
              social media profiles). Their privacy practices are governed by
              their own policies, not ours. We encourage you to review them.
            </p>
          </section>

          <section id="changes" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              12. Changes to this policy
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              We may update this Privacy Policy from time to time. The
              &quot;Last updated&quot; date at the top shows when it was most
              recently revised. If a change materially affects how we use or
              share information we collect, we will notify you through the
              Service or by email before the change takes effect.
            </p>
          </section>

          <section id="contact" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">13. Contact</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              For questions or requests about this Privacy Policy or your
              information, contact CivicRide, Inc. at{" "}
              <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
                contact@civicride.com
              </a>{" "}
              or call{" "}
              <a href="tel:+18005550199" className="text-brand-600 hover:underline">
                +1 (800) 555-0199
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
