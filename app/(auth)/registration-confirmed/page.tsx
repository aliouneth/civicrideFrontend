import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../_components/AuthLayout";

export const metadata: Metadata = { title: "Registration confirmed" };

export default function RegistrationConfirmedPage() {
  return (
    <AuthShell
      title="Registration confirmed"
      subtitle=""
      footer={<Link href="/login" className="text-brand-600 hover:underline">Back to login</Link>}
    >
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-4">Registration confirmed</h1>
        <div className="prose prose-ink max-w-none text-left">
          <p className="text-ink-600 mb-4">
            Registration confirmed. Your Agency personnel is reviewing your registration.
          </p>
          <p className="text-ink-600 mb-4">
            After approval, you will be able to start driving.
          </p>
          <p className="text-ink-600 mb-4">
            In the meantime, you may login and update your personal information and upload your documents.
          </p>
          <p className="text-ink-600 mb-8">
            Thank you for your willingness to help make our members happier.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </AuthShell>
  );
}