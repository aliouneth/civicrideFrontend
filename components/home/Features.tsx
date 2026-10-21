"use client";

import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    art: <RoutingArt />,
    title: "AI-Driven Routing",
    description:
      "Machine learning algorithms analyze historical ridership, traffic patterns, and real-time conditions to generate optimal routes that adapt to changing demand throughout the day.",
    metrics: [
      { label: "Avg. wait time reduction", value: "27%" },
      { label: "On-time performance", value: "99.2%" },
      { label: "Miles optimized daily", value: "12,000+" },
    ],
    gradient: "from-brand-500 to-brand-600",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    art: <SchedulingArt />,
    title: "Demand-Responsive Scheduling",
    description:
      "Real-time demand signals from mobile apps, fixed stops, and partner APIs feed dynamic scheduling engines that right-size vehicle deployment minute-by-minute.",
    metrics: [
      { label: "Empty seat miles cut", value: "41%" },
      { label: "Dynamic trips/day", value: "3,400+" },
      { label: "Avg. response time", value: "< 3 min" },
    ],
    gradient: "from-accent-500 to-accent-600",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 6a6 6 0 110 12 6 6 0 010-12z" />
      </svg>
    ),
    art: <CarbonArt />,
    title: "Carbon Footprint Reduction",
    description:
      "Electrification planning tools, route consolidation, and occupancy optimization cut emissions per passenger-mile while maintaining service quality.",
    metrics: [
      { label: "CO₂e reduced annually", value: "18,000+ tons" },
      { label: "EV fleet transitions", value: "12 agencies" },
      { label: "Passenger-mi efficiency", value: "+34%" },
    ],
    gradient: "from-ok-fg to-emerald-600",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 mb-4">
            What We Do
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Efficiency, Intelligence, Sustainability — Built In
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            Three pillars that transform how transit agencies plan, operate, and measure success.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <article
              key={index}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Gradient top border */}
              <div
                className="absolute top-0 left-0 right-0 z-10 h-1"
                style={{ background: `linear-gradient(90deg, ${feature.gradient.split(" to ")[0]}, ${feature.gradient.split(" to ")[1]})` }}
              />

              {/* Illustration */}
              <div className="h-44 shrink-0 overflow-hidden">{feature.art}</div>

              <div className="relative flex flex-1 flex-col p-6 pt-9">
                {/* Icon badge overlapping the illustration */}
                <div
                  className="absolute -top-7 left-6 inline-flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-md ring-4 ring-card"
                  style={{ background: `linear-gradient(135deg, ${feature.gradient})` }}
                  aria-hidden="true"
                >
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-ink-900">{feature.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-500">{feature.description}</p>

                {/* Metrics pinned to the card footer */}
                <div className="mt-6 flex-1" aria-hidden="true" />
                <div className="grid grid-cols-3 gap-4 border-t border-line pt-4">
                  {feature.metrics.map((metric, mIndex) => (
                    <div key={mIndex} className="text-center">
                      <div className="text-2xl font-bold text-ink-900 tnum">{metric.value}</div>
                      <div className="text-xs text-ink-500 mt-0.5">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Additional features list */}
        <div className="mt-16">
          <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-ink-500 mb-8">
            More Capabilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "📊", title: "Real-Time Analytics Dashboard", desc: "Live KPIs, heatmaps, and predictive alerts for dispatchers." },
              { icon: "🔗", title: "Open API & Integrations", desc: "REST/GraphQL APIs, GTFS-Realtime, Trapeze, Ecolane, and more." },
              { icon: "🚌", title: "Mixed-Fleet Optimization", desc: "Unified scheduling for fixed-route, paratransit, and microtransit." },
              { icon: "🛡️", title: "Enterprise Security", desc: "SOC 2, HIPAA-ready, SSO/SCIM, and role-based access control." },
            ].map((item, i) => (
              <Card key={i} className="p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-ink-900 mb-2">{item.title}</h4>
                <p className="text-sm text-ink-500">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Routing map: connected stops with a live vehicle on the network. */
function RoutingArt() {
  return (
    <svg viewBox="0 0 400 176" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="176" className="fill-brand-50" />
      <rect x="28" y="22" width="84" height="50" rx="10" className="fill-white/70" />
      <rect x="258" y="116" width="112" height="44" rx="10" className="fill-white/70" />
      <rect x="136" y="16" width="54" height="32" rx="8" className="fill-white/50" />
      <path
        d="M44 136 C 100 136, 96 64, 168 64 S 268 112, 356 44"
        fill="none"
        className="stroke-brand-500"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="0.5 13"
      />
      <circle cx="44" cy="136" r="8" className="fill-white stroke-brand-600" strokeWidth="3.5" />
      <circle cx="168" cy="64" r="8" className="fill-white stroke-brand-600" strokeWidth="3.5" />
      <circle cx="356" cy="44" r="8" className="fill-white stroke-brand-600" strokeWidth="3.5" />
      <circle cx="262" cy="94" r="15" className="fill-brand-600" />
      <circle cx="262" cy="94" r="5.5" className="fill-white" />
    </svg>
  );
}

/** Scheduling board: demand bars, a clock, and a dispatched vehicle. */
function SchedulingArt() {
  return (
    <svg viewBox="0 0 400 176" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="176" className="fill-accent-50" />
      <rect x="36" y="28" width="218" height="118" rx="12" className="fill-white/80" />
      <rect x="60" y="96" width="22" height="34" rx="5" className="fill-accent-300" />
      <rect x="94" y="74" width="22" height="56" rx="5" className="fill-accent-400" />
      <rect x="128" y="88" width="22" height="42" rx="5" className="fill-accent-300" />
      <rect x="162" y="54" width="22" height="76" rx="5" className="fill-accent-500" />
      <rect x="196" y="66" width="22" height="64" rx="5" className="fill-accent-400" />
      <path d="M52 134h190" className="stroke-line" strokeWidth="2" strokeLinecap="round" />
      <circle cx="318" cy="62" r="34" className="fill-white/80 stroke-accent-300" strokeWidth="6" />
      <path
        d="M318 44v19l13 8"
        fill="none"
        className="stroke-accent-600"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="286" y="114" width="78" height="36" rx="9" className="fill-accent-600" />
      <rect x="296" y="124" width="19" height="12" rx="3" className="fill-white/80" />
      <rect x="321" y="124" width="19" height="12" rx="3" className="fill-white/80" />
      <circle cx="303" cy="151" r="6" className="fill-ink-900" />
      <circle cx="347" cy="151" r="6" className="fill-ink-900" />
    </svg>
  );
}

/** Emissions: a leaf paired with a falling CO2 indicator. */
function CarbonArt() {
  return (
    <svg viewBox="0 0 400 176" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="176" className="fill-ok-bg" />
      <path
        d="M168 142 C 112 118 112 66 190 36 C 234 18 292 26 292 26 C 290 86 258 134 168 142 Z"
        className="fill-ok-fg"
        fillOpacity="0.9"
      />
      <path
        d="M178 130 C 204 102 234 74 274 52"
        fill="none"
        className="stroke-white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M168 142 L148 162" fill="none" className="stroke-ok-fg" strokeWidth="5" strokeLinecap="round" />
      <circle cx="316" cy="112" r="36" className="fill-white" />
      <text x="316" y="98" textAnchor="middle" className="fill-ok-fg" fontSize="15" fontWeight="700">
        CO₂
      </text>
      <path
        d="M316 106v30m0 0l-11-11m11 11l11-11"
        fill="none"
        className="stroke-ok-fg"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}