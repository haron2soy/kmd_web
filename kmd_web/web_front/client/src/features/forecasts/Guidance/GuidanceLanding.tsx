// src/features/forecasts/ForecastLanding.tsx
import  LinkCard  from "./LinkCard";
//import { PageLayout } from "@/shared/components/layout/PageLayout";
import { useScrollToHeader } from "@/shared/components/ScrollToHeader/useScrollToHeader";


const shortRangeLinks = [
  { href: "/guidance/marine-forecast-daily", label: "Marine Forecast Daily" },
  { href: "/guidance/marine-forecast-seven-days", label: "Marine Forecast Weekly" },
  { href: "/guidance/easwfp-discussion-daily", label: "EAsfwp Discussion" },
];


const archiveLinks = [
  { href: "/guidance/archive", label: "View Past Guideance & Archive" },
  // add more when needed
];

export default function GuidanceLanding() {
  const { headerRef } = useScrollToHeader([], 80);
  return (
    //<PageLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <header ref={headerRef} className="mb-4 md:mb-4">
          <h2 className="text-xl md:text-xl font-serif font-bold text-primary mb-3">
            Guidance
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl">
           Guidance and forecasts, risk assessments, discussions, and archived guidance.
          </p>
        </header>

        {/* Short Range */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-primary mb-6">
            Marine Forecasts and EAswfp Discussions
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {shortRangeLinks.map((link) => (
              <LinkCard  key={link.href} href={link.href} label={link.label} />
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
              <LinkCard  key={link.href} href={link.href} label={link.label} />
            ))}
          </div>
        </section>
      </div>
    //</PageLayout>
  );
}