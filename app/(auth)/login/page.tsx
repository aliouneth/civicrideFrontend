import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../_components/AuthForm";
import { AuthFooterLink, AuthShell } from "../_components/AuthLayout";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthShell
      subtitle="Log in to your agency workspace."
      footer={<AuthFooterLink prefix="New driver?" href="/register" linkLabel="Create an account" />}
    >
      <Suspense fallback={<Spinner />}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}