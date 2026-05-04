// src/features/swfp/SWFPLanding.tsx
import { Link } from "wouter";
import { useEffect } from "react";
import { useScrollToHeader } from "../../shared/components/ScrollToHeader/useScrollToHeader";

// -------------------------------
// Card (UNCHANGED)
// -------------------------------
const Card = ({ href, label }: { href: string; label: string }) => (
  <Link href={href}>
    <div className="group p-6 border rounded-lg bg-white hover:shadow-md hover:border-primary/40 transition">
      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary">
        {label}
      </h3>
    </div>
  </Link>
);

const links = [
  { href: "/swfp-evaluation/quarterly-report", label: "Quarterly Report" },
  { href: "/swfp-evaluation/event-table", label: "Event Table" },
];

// -------------------------------
// Page
// -------------------------------
export default function SWFPLanding() {
  const { headerRef } = useScrollToHeader([], 80);

  useEffect(() => {
    document.title = "SWFP | RSMC Nairobi";
  }, []);

  const QuickLinks = [
    { href: "/forecasts/risk-table-short", label: "Short-Range Risk Table" },
    { href: "/forecasts/discussion-short", label: "Short-Range Discussion" },
    { href: "/forecasts/risk-table-medium", label: "Medium-Range Risk Table" },
    { href: "/forecasts/discussion-medium", label: "Medium-Range Discussion" },
    { href: "/guidance", label: "Guidance" },
    { href: "/nwp-models", label: "NWP Models" },
    { href: "/forecasts/archive", label: "Forecast Archive" },
  ];

  return (
    <div className="mx-auto px-4 max-w-7xl">

      {/* ✅ SAME GRID AS NWP */}
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
                    <div className="py-1 px-3 rounded hover:bg-orange-50 hover:text-orange-600 cursor-pointer">
                      {link.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ✅ MAIN CONTENT */}
        <div className="lg:col-span-9 w-full flex flex-col">

          <header ref={headerRef} className="mb-4 md:mb-4">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-4">
              SWFP Evaluation
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Access SWFP evaluation tools including Quarterly report and event datasets.
            </p>
          </header>

          {/* CARDS (UNCHANGED) */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l) => (
              <Card key={l.href} {...l} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}