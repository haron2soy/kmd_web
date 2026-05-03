import { Link } from "wouter";
import LinkCard from "./LinkCard";
import { useScrollToHeader } from "@/shared/components/ScrollToHeader/useScrollToHeader";

export default function GuidanceLanding() {
  const { headerRef } = useScrollToHeader([], 80);

  const QuickLinks = [
    { href: "/forecasts/risk-table-short", label: "Short-Range Risk Table" },
    { href: "/forecasts/discussion-short", label: "Short-Range Discussion" },
    { href: "/forecasts/risk-table-medium", label: "Medium-Range Risk Table" },
    { href: "/forecasts/discussion-medium", label: "Medium-Range Discussion" },
    { href: "/guidance", label: "Guidance" },
    { href: "/nwp-models", label: "NWP Models" },
    { href: "/forecasts/archive", label: "Forecast Archive" },
  ];

  const shortRangeLinks = [
    { href: "/guidance/marine-forecast-daily", label: "Marine Forecast Daily" },
    { href: "/guidance/marine-forecast-seven-days", label: "Marine Forecast Weekly" },
    { href: "/guidance/easwfp-discussion-daily", label: "EAsfwp Discussion" },
  ];

  const archiveLinks = [
    { href: "/guidance/archive", label: "View Past Guidance & Archive" },
  ];

  return (
    <div className="mx-auto px-4 max-w-7xl">

      {/* ✅ SAME GRID SYSTEM AS FORECASTS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">

        {/* ✅ SIDEBAR (IDENTICAL) */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-20">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                {QuickLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className="py-2 px-3 rounded hover:bg-orange-50 hover:text-orange-600 cursor-pointer">
                      {link.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ✅ RIGHT CONTENT */}
        <div className="lg:col-span-9 w-full">

          {/* HEADER ONLY AFFECTS RIGHT SIDE */}
          <header ref={headerRef} className="mb-4">
            <h2 className="text-xl font-serif font-bold text-primary mb-2">
              Guidance
            </h2>
            <p className="text-gray-600 max-w-3xl">
              Guidance and forecasts, risk assessments, discussions, and archived guidance.
            </p>
          </header>

          {/* SHORT RANGE */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Marine Forecasts and EAswfp Discussions
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shortRangeLinks.map((link) => (
                <LinkCard key={link.href} href={link.href} label={link.label} />
              ))}
            </div>
          </section>

          {/* ARCHIVE */}
          <section>
            <h2 className="text-lg font-semibold text-primary mb-4">
              Archive & Historical Data
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {archiveLinks.map((link) => (
                <LinkCard key={link.href} href={link.href} label={link.label} />
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}