"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const subjects = [
  { value: "sales", label: "Sales & Partnerships" },
  { value: "support", label: "Technical Support" },
  { value: "demo", label: "Request a Demo" },
  { value: "press", label: "Press & Media" },
  { value: "careers", label: "Careers" },
  { value: "other", label: "Other" },
];

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const validate = (data: FormData): FormErrors => {
    const newErrors: FormErrors = {};

    if (!data.name.trim()) {
      newErrors.name = "Name is required";
    } else if (data.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!data.subject) {
      newErrors.subject = "Please select a subject";
    }

    if (!data.message.trim()) {
      newErrors.message = "Message is required";
    } else if (data.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = validate(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      // In production, this would POST to your API endpoint
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error('Submission failed');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please email us directly at contact@civicride.com");
    }
  };

  return (
    <section id="contact" className="scroll-mt-24 py-20 lg:py-28 bg-brand-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 mb-4">
            Contact Us
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Let&apos;s Build Better Rides Coordination Together
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            Have questions? Want a demo? Our team responds within 24 hours.
            <br />Or email us directly at{" "}
            <a href="mailto:contact@civicride.com" className="text-brand-600 hover:underline font-medium">
              contact@civicride.com
            </a>
          </p>
        </div>

        <div className="mx-auto max-w-xl">
          {/* Success state */}
          {status === "success" && (
            <div className="rounded-xl bg-ok-bg border border-ok-fg/20 p-8 text-center" role="status">
              <svg className="mx-auto h-12 w-12 text-ok-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="mt-4 text-xl font-bold text-ok-fg">Message Sent!</h3>
              <p className="mt-2 text-ok-fg/90">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
              <Button
                variant="primary"
                className="mt-6"
                onClick={() => setStatus("idle")}
              >
                Send Another Message
              </Button>
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="rounded-xl bg-bad-bg border border-bad-fg/20 p-6 text-center" role="alert">
              <svg className="mx-auto h-12 w-12 text-bad-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-4 text-xl font-bold text-bad-fg">Submission Failed</h3>
              <p className="mt-2 text-bad-fg/90">{errorMessage}</p>
              <Button variant="primary" className="mt-4" onClick={() => setStatus("idle")}>
                Try Again
              </Button>
            </div>
          )}

          {/* Form */}
          {status !== "success" && (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  name="name"
                  label="Full Name"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                  autoComplete="name"
                />
                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="jane@transitagency.gov"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  autoComplete="email"
                />
              </div>

              <Select
                name="subject"
                label="Subject"
                value={formData.subject}
                onChange={(e) => handleChange(e as unknown as React.ChangeEvent<HTMLSelectElement>)}
                error={errors.subject}
                required
                options={subjects}
              />

              <Textarea
                name="message"
                label="Message"
                placeholder="Tell us about your needs, timeline, fleet size, or anything else relevant..."
                value={formData.message}
                onChange={handleChange}
                error={errors.message}
                required
                rows={5}
              />

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  required
                  className="mt-1 h-4 w-4 rounded border-line bg-card text-brand-600 focus:ring-2 focus:ring-brand-500"
                />
                <label htmlFor="consent" className="text-sm text-ink-500">
                  I agree to be contacted by CivicRide regarding my inquiry.{" "}
                  <a href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</a>
                </label>
              </div>

              <Button type="submit" variant="primary" className="w-full sm:w-auto min-w-[200px]" loading={status === "submitting"}>
                {status === "submitting" ? "Sending..." : "Send Message"}
              </Button>

              <p className="text-center text-xs text-ink-500">
                By submitting, you agree to our{" "}
                <a href="/terms" className="text-brand-600 hover:underline">Terms of Service</a>
                {" and "}
                <a href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</a>
                . We&apos;ll never share your data.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}