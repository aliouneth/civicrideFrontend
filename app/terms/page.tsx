import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";

export const metadata: Metadata = { title: "Terms of Service" };

const sections = [
  { id: "service", label: "1. The Service" },
  { id: "accounts", label: "2. Accounts" },
  { id: "agency-responsibilities", label: "3. Agency responsibilities" },
  { id: "drivers", label: "4. Driver accounts" },
  { id: "ride-information", label: "5. Ride information" },
  { id: "acceptable-use", label: "6. Acceptable use" },
  { id: "your-data", label: "7. Your data" },
  { id: "intellectual-property", label: "8. Intellectual property" },
  { id: "fees", label: "9. Fees" },
  { id: "security", label: "10. Security" },
  { id: "termination", label: "11. Termination" },
  { id: "disclaimers", label: "12. Disclaimers" },
  { id: "liability", label: "13. Limitation of liability" },
  { id: "indemnity", label: "14. Indemnification" },
  { id: "law", label: "15. Governing law" },
  { id: "changes", label: "16. Changes to these Terms" },
  { id: "contact", label: "17. Contact" },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-ink-500">Last updated: November 4, 2026</p>

          <p className="mt-6 text-lg text-ink-500">
            These Terms of Service govern your access to and use of the CivicRide
            platform, website, and related services (collectively, the
            &quot;Service&quot;) provided by CivicRide, Inc. (&quot;CivicRide,&quot;
            &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an
            account, accessing the Service, or clicking to accept these Terms, you
            agree to be bound by them. If you use the Service on behalf of an
            organization, you represent that you have authority to bind that
            organization, and &quot;you&quot; includes that organization.
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

          <section id="service" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">1. The Service</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRide is a cloud-based ride coordination platform for transit
              agencies and mobility providers. It lets agency staff schedule rides,
              manage a dispatch board, assign drivers, and run reports, while
              drivers receive assignments, execute rides, and upload the documents
              their agency requires. The Service is delivered on a multi-tenant
              basis: each agency (a &quot;tenant&quot;) has its own isolated
              workspace, and users only see the data belonging to their own agency.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              We may add, change, or remove features over time. Material changes to
              the Service that significantly reduce core functionality will be
              announced through the Service or by email where practicable.
            </p>
          </section>

          <section id="accounts" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">2. Accounts</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                <span className="font-semibold text-ink-900">Agency accounts.</span>{" "}
                Agency administrators create the agency workspace and invite or
                approve the people who work in it (supervisors, schedulers, and
                drivers). The administrator is responsible for who is given access.
              </li>
              <li>
                <span className="font-semibold text-ink-900">Driver accounts.</span>{" "}
                Drivers apply for an account and are approved by their agency
                before they can receive rides.
              </li>
              <li>
                <span className="font-semibold text-ink-900">Credential security.</span>{" "}
                You must keep your login credentials confidential, use a strong
                password (we enforce a minimum length with letters and numbers),
                and notify your agency administrator or us promptly at{" "}
                <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
                  contact@civicride.com
                </a>{" "}
                if you suspect unauthorized access. You are responsible for all
                activity that happens under your account.
              </li>
              <li>
                <span className="font-semibold text-ink-900">Accuracy.</span> The
                information you provide at registration and in your profile must be
                accurate and kept up to date.
              </li>
            </ul>
          </section>

          <section id="agency-responsibilities" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              3. Agency responsibilities
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              You are responsible for your agency&apos;s use of the Service,
              including:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                Deciding which employees and drivers get accounts, what roles they
                receive, and removing access when someone leaves.
              </li>
              <li>
                Operating your transportation service in compliance with
                applicable laws, including vehicle licensing, insurance, driver
                qualification, accessibility, and paratransit obligations.
              </li>
              <li>
                Ensuring you have a lawful basis to provide passenger and driver
                information to the Service (see Section 5).
              </li>
              <li>
                All activity performed by users in your workspace, including ride
                creation, dispatch decisions, and report exports.
              </li>
            </ul>
          </section>

          <section id="drivers" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              4. Driver accounts
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Drivers must provide and maintain accurate information, including
              driver&apos;s license details, vehicle information, and any documents
              their agency requires (such as insurance or background-check
              results). Information that is expired, falsified, or otherwise
              non-compliant is grounds for rejection, suspension, or removal by
              your agency or by CivicRide.
            </p>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Drivers are expected to conduct themselves professionally and safely
              during rides, to treat passengers with respect, and to follow their
              agency&apos;s operating policies. The Service records ride status,
              timing, and notes for operational and accountability purposes.
            </p>
          </section>

          <section id="ride-information" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              5. Ride information
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Agencies enter ride details into the Service on behalf of their
              passengers: names, contact numbers, pickup and dropoff locations,
              scheduled times, accessibility needs, and operational notes. The
              agency is the controller of that information and is responsible for
              having permission to share it. Drivers see only the ride details
              needed to perform their assignments.
            </p>
          </section>

          <section id="acceptable-use" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              6. Acceptable use
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              You agree not to misuse the Service. In particular, you will not:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-500 leading-relaxed">
              <li>
                Use the Service for any unlawful purpose, or to transport
                passengers in violation of applicable law.
              </li>
              <li>
                Attempt to gain access to another agency&apos;s workspace or to
                data outside your role&apos;s permissions.
              </li>
              <li>
                Interfere with or disrupt the Service, including circumventing
                rate limits, authentication, or audit controls.
              </li>
              <li>
                Probe, scan, or reverse engineer any part of the Service except
                where expressly permitted by law.
              </li>
              <li>
                Upload malicious code, or use the Service to send spam or
                unsolicited messages.
              </li>
              <li>
                Impersonate another person or misrepresent your affiliation with
                any organization.
              </li>
              <li>
                Resell or white-label the Service without a separate written
                agreement with CivicRide.
              </li>
            </ul>
          </section>

          <section id="your-data" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">7. Your data</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              You retain ownership of the data your agency inputs into the
              Service. You grant CivicRide a limited license to host, process,
              transmit, and display that data solely to operate and improve the
              Service, consistent with our{" "}
              <Link href="/privacy" className="text-brand-600 hover:underline">
                Privacy Policy
              </Link>
              . Feedback you provide may be used to improve the Service without
              obligation to you.
            </p>
          </section>

          <section id="intellectual-property" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              8. Intellectual property
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              The Service, including its software, design, documentation, and
              CivicRide trademarks, is owned by CivicRide and its licensors and is
              protected by intellectual property laws. Except for the limited
              right to use the Service under these Terms, no rights are granted to
              you.
            </p>
          </section>

          <section id="fees" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">9. Fees</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Paid plans are billed according to the order form or subscription
              agreement between you and CivicRide. Unless stated otherwise, fees
              are non-refundable, exclude taxes, and are due per the payment terms
              in that agreement. We may change pricing with at least 30 days&apos;
              notice, effective at your next renewal.
            </p>
          </section>

          <section id="security" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">10. Security</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              CivicRide implements administrative, technical, and organizational
              safeguards appropriate to a multi-tenant transit platform, including
              role-based access control, per-agency data isolation, audit logging
              of security-relevant actions, credential rate limiting, encrypted
              transmission (HTTPS), and expiring session credentials. You are
              responsible for managing access within your agency and for the
              devices your users employ to reach the Service.
            </p>
          </section>

          <section id="termination" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              11. Termination
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              You may stop using the Service at any time and request closure of
              your agency workspace by contacting us. We may suspend or terminate
              access if you materially breach these Terms, if required by law, or
              if continued use creates a security or legal risk. Where reasonably
              practicable, we will give you notice and an opportunity to remedy
              the breach. On termination, your right to use the Service ends, and
              we will delete or return your agency data in accordance with our
              retention obligations and the Privacy Policy.
            </p>
          </section>

          <section id="disclaimers" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              12. Disclaimers
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
              AVAILABLE.&quot; TO THE MAXIMUM EXTENT PERMITTED BY LAW, CIVICRIDE
              DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
              UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT RIDES WILL BE
              COMPLETED AS SCHEDULED. THE SERVICE SUPPORTS YOUR OPERATIONS; IT
              DOES NOT REPLACE YOUR OWN SAFETY, LICENSING, OR REGULATORY
              OBLIGATIONS.
            </p>
          </section>

          <section id="liability" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              13. Limitation of liability
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER CIVICRIDE NOR ITS
              OFFICERS, EMPLOYEES, OR SUPPLIERS WILL BE LIABLE FOR INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST
              PROFITS, DATA, OR GOODWILL, EVEN IF ADVISED OF THE POSSIBILITY. OUR
              TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICE
              WILL NOT EXCEED THE AMOUNTS YOU PAID TO CIVICRIDE IN THE TWELVE
              MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM. THESE LIMITATIONS
              APPLY REGARDLESS OF THE THEORY OF LIABILITY.
            </p>
          </section>

          <section id="indemnity" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              14. Indemnification
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              You will defend and hold harmless CivicRide from and against claims,
              damages, and expenses (including reasonable legal fees) arising from
              your agency&apos;s use of the Service, your violation of these
              Terms, or your violation of any law or third-party right, except to
              the extent caused by CivicRide&apos;s own breach.
            </p>
          </section>

          <section id="law" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              15. Governing law
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              These Terms are governed by the laws of the State of Delaware,
              without regard to its conflict-of-law rules, and the state and
              federal courts located in Delaware will have exclusive jurisdiction
              over any dispute. If any provision is found unenforceable, the
              remaining provisions stay in effect.
            </p>
          </section>

          <section id="changes" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">
              16. Changes to these Terms
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              We may update these Terms from time to time. If a change is
              material, we will notify you through the Service or by email before
              it takes effect. The &quot;Last updated&quot; date at the top shows
              when the Terms were most recently revised. Continuing to use the
              Service after the effective date constitutes acceptance of the
              updated Terms.
            </p>
          </section>

          <section id="contact" className="mt-10 scroll-mt-32">
            <h2 className="text-xl font-semibold text-ink-900">17. Contact</h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Questions about these Terms? Contact CivicRide, Inc. at{" "}
              <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline">
                contact@civicride.com
              </a>{" "}
              or call{" "}
              <a href="tel:+19203831918" className="text-brand-600 hover:underline">
                +1 (920) 383-1918
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
