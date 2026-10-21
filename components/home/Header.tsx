"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#about", label: "About Us" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-line">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="CivicRide home">
            <Logo variant="lockup" height={54} priority />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ink-500 hover:text-brand-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden xl:inline-flex">
              <Button variant="ghost" className="min-w-[90px]">
                Log In
              </Button>
            </Link>
            <Link href="#contact" className="hidden sm:inline-flex">
              <Button variant="ghost" className="whitespace-nowrap px-3 text-sm">
                Get Started As Agency
              </Button>
            </Link>
            <Link href="/register" className="hidden sm:inline-flex">
              <Button variant="primary" className="whitespace-nowrap px-3 text-sm">
                Get Started As Driver
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}