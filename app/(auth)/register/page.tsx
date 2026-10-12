import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../_components/AuthForm";
import { AuthFooterLink, AuthShell } from "../_components/AuthLayout";
import { Spinner } from "@/components/ui/Spinner";
import Script from "next/script";

export const metadata: Metadata = { title: "Create driver account" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Drive with your agency"
      subtitle="Create your driver account, then complete onboarding."
      footer={<AuthFooterLink prefix="Already registered?" href="/login" linkLabel="Log in" />}
    >
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
      />
      <Suspense fallback={<Spinner />}>
        <AuthForm mode="register" />
      </Suspense>
    </AuthShell>
  );
}