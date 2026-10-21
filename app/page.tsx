import { redirect } from "next/navigation";
import { getCurrentUser, roleHome } from "@/lib/auth";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { ContactForm } from "@/components/home/ContactForm";
import { Footer } from "@/components/home/Footer";

export const metadata = {
  title: "CivicRide — Smarter Transit. With You Along the Way.",
  description:
    "AI-powered routing, real-time analytics, and seamless multi-modal scheduling for modern transit agencies. Start your free trial today.",
  openGraph: {
    title: "CivicRide — Smarter Transit. With You Along the Way.",
    description:
      "AI-powered routing, real-time analytics, and seamless multi-modal scheduling for modern transit agencies.",
    type: "website",
  },
};

// Session-aware: must run per request so logged-in users are redirected.
export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  // Redirect authenticated users to their dashboard
  if (user) {
    redirect(roleHome(user.role.name));
  }

  // Show marketing page for non-authenticated users
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Features />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}