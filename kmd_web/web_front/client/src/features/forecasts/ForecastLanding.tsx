// src/features/forecasts/ForecastLanding.tsx
import { Link } from "wouter";
import { useEffect } from "react";
//import { PageLayout } from "@/shared/components/layout/PageLayout";
import { useScrollToHeader } from "@/shared/components/ScrollToHeader/useScrollToHeader";
const ForecastCard = ({ href, label }: { href: string; label: string }) => (
  <Link href={href}>
    <div className="group relative p-3 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary/40 transition-all duration-200 bg-white">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">
        {label}
      </h3>
    </div>
    
  </Link>
);

const shortRangeLinks = [
  { href: "/forecasts/day-1", label: "Day 1 Forecast" },
  { href: "/forecasts/day-2", label: "Day 2 Forecast" },
  { href: "/forecasts/risk-table-short", label: "Short-Range Risk Table" },
  { href: "/forecasts/discussion-short", label: "Short-Range Discussion" },
];

const mediumRangeLinks = [
  { href: "/forecasts/day-3", label: "Day 3 Forecast" },
  { href: "/forecasts/day-4", label: "Day 4 Forecast" },
  { href: "/forecasts/day-5", label: "Day 5 Forecast" },
  { href: "/forecasts/risk-table-medium", label: "Medium-Range Risk Table" },
  { href: "/forecasts/discussion-medium", label: "Medium-Range Discussion" },
];

const archiveLinks = [
  { href: "/forecasts/archive", label: "View Past Forecasts & Archive" },
  // add more when needed
];

export default function ForecastLanding() {
  const { headerRef } = useScrollToHeader(80);
  // Set browser tab title
  useEffect(() => {
    document.title = "Forecasts | RSMC Nairobi";
  }, []);

  return (
    //<PageLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <header ref={headerRef} className="mb-4 md:mb-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
            Forecasts
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Access short-range (1–2 days), medium-range (3–5 days) forecasts, risk assessments, discussions, and archived guidance.
          </p>
        </header>

        {/* Short Range */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-primary mb-6">
            Short Range Forecasts (1–2 days)
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {shortRangeLinks.map((link) => (
              <ForecastCard key={link.href} href={link.href} label={link.label} />
            ))}
          </div>
        </section>

        {/* Medium Range */}
        <section className="mb-4">
          <h2 className="text-xl font-semibold text-primary mb-3">
            Medium Range Forecasts (3–5 days)
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {mediumRangeLinks.map((link) => (
              <ForecastCard key={link.href} href={link.href} label={link.label} />
            ))}
          </div>
        </section>

        {/* Archive */}
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Archive & Historical Data
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {archiveLinks.map((link) => (
              <ForecastCard key={link.href} href={link.href} label={link.label} />
            ))}
          </div>
        </section>
      </div>
    //</PageLayout>
  );
}