// src/features/services/RegionalInternationalLanding.tsx

import { useScrollToHeader } from "@/shared/components/ScrollToHeader/useScrollToHeader";
import type { ServiceItem } from "./RegionalInternational";
import { RegionalInternational } from "./RegionalInternational";
import { useEffect } from "react";
import { Link } from "wouter";
import { Globe, ExternalLink } from "lucide-react";

// -------------------------------
// Card (MATCH PRODUCTS)
// -------------------------------
const Card = ({ name, url }: ServiceItem) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group block bg-gray-200 border border-gray-200 rounded-xl p-4 
               hover:border-primary hover:shadow-sm transition-all duration-200 
               hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-primary/20"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Globe className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
        <h3 className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors line-clamp-2 pr-2">
          {name}
        </h3>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
    </div>
  </a>
);

// -------------------------------
// Page
// -------------------------------
export default function RegionalInternationalLanding() {
  const { headerRef } = useScrollToHeader([], 80);

  useEffect(() => {
    document.title = "Regional | RSMC Nairobi";
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">

        {/* SIDEBAR — identical */}
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

        {/* MAIN */}
        <div className="lg:col-span-9 w-full flex flex-col">

          {/* HEADER — match Products spacing */}
          <header ref={headerRef} className="mb-4 md:mb-4">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-10">
              Meteorological Services
            </h2>
          </header>

          <p className="text-lg text-gray-600 mb-12 max-w-3xl">
            Official regional and international meteorological services.
          </p>

          {/* ✅ MATCH PRODUCTS WRAPPER */}
          <div className="bg-gray-200 border border-gray-200 rounded-xl p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {RegionalInternational.map((item) => (
                <Card key={item.slug} {...item} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}