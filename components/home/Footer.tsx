import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "API Docs", href: "/docs" },
    { label: "Integrations", href: "/integrations" },
    { label: "Changelog", href: "/changelog" },
  ],
  company: [
    { label: "About Us", href: "#about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
    { label: "Partners", href: "/partners" },
    { label: "Contact", href: "#contact" },
  ],
  resources: [
    { label: "Help Center", href: "/help" },
    { label: "API Reference", href: "/docs/api" },
    { label: "Community Forum", href: "/community" },
    { label: "Webinars", href: "/webinars" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Security", href: "/security" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "HIPAA", href: "/hipaa" },
    { label: "SOC 2 Report", href: "/soc2" },
  ],
};

const socialLinks = [
  { name: "Twitter / X", href: "https://twitter.com/civicride" },
  { name: "LinkedIn", href: "https://linkedin.com/company/civicride" },
  { name: "Facebook", href: "https://facebook.com/civicride" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink-900 text-white" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="text-ink-300 text-base leading-relaxed max-w-xs mb-6">
              With you along the way. Building smarter, cleaner, more equitable transit
              for every community.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:contact@civicride.com"
                className="text-ink-400 hover:text-white transition-colors text-sm"
              >
                contact@civicride.com
              </a>
              <span className="text-ink-600">|</span>
              <a
                href="tel:+19203831918"
                className="text-ink-400 hover:text-white transition-colors text-sm"
              >
                +1 (920) 383-1918
              </a>
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product links">
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company links">
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources links">
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal links">
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-ink-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-ink-400 text-sm">
              © {currentYear} CivicRide, Inc. All rights reserved.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-400 hover:text-white transition-colors text-sm"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}