// src/features/services/RegionalInternationalLanding.tsx

import { useScrollToHeader } from "@/shared/components/ScrollToHeader/useScrollToHeader";
import type { ServiceItem } from "./ProductDetails";
import { ProductDetails } from "./ProductDetails";
import { useEffect } from "react";
import {Link} from "wouter";
import { ExternalLink, Globe, Satellite } from "lucide-react";

const Card = ({ name, url }: ServiceItem) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group block bg-gray-200 border border-gray-200 rounded-xl p-4 
               hover:border-primary hover:shadow-sm transition-all duration-200 
               hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-primary/20"
    aria-label={`Visit ${name} (opens in new tab)`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-primary/70 group-hover:text-primary transition-colors">
          <Globe className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors line-clamp-2 pr-2">
          {name}
        </h3>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary flex-shrink-0 transition-colors" />
    </div>
  </a>
);

export default function ProductsLanding() {
  const { headerRef } = useScrollToHeader(80);

  useEffect(() => {
    document.title = "Meteorological Services | RSMC Nairobi";
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
    <div className="min-h-screen bg-gray-50 py-0 md:py-0 relative overflow-hidden">
      
      {/* 🌌 Decorative satellite images (no layout interference) */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://pplx-res.cloudinary.com/image/upload/pplx_search_images/78975044cd7cae81c6d6f0244628eee248776945.jpg"
          alt=""
          className="absolute left-4 top-0 w-32 md:w-40 opacity-30"
        />
        <img
          src="https://pplx-res.cloudinary.com/image/upload/pplx_search_images/4ce1a134295cdd7ed0a5ea333671c6e0ff037605.jpg"
          alt=""
          className="absolute right-4 top-0 w-36 md:w-44 opacity-50"
        />
        <img
          src="https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5a163b637f156afb67f32fedf1457066671a416a.jpg"
          alt=""
          className="absolute left-10 bottom-30 w-28 md:w-36 opacity-50"
        />
        <img
          src="https://pplx-res.cloudinary.com/image/upload/pplx_search_images/5a163b637f156afb67f32fedf1457066671a416a.jpg"
          alt=""
          className="absolute right-10 bottom-16 w-28 md:w-36 opacity-50"
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">

        {/* SIDEBAR */}
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
      <div className="lg:col-span-9 w-full flex flex-col">
        
        {/* Header */}
        <header ref={headerRef} className="text-center mb-10">
          <h1 className="text-xl md:text-2xl font-serif font-bold text-primary mb-3 flex items-center justify-center gap-3">
            <Satellite className="w-6 h-6" />
            Meteorological Services
          </h1>
          <p className="text-gray-600 max-w-md mx-auto text-[15px]">
            Official national and regional meteorological websites
          </p>
        </header>

        {/* Services grid */}
        <div className="bg-gray-200  border border-gray-200
                rounded-xl p-4 hover:bg-gray-300 hover:shadow-md transition">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-4">
          {ProductDetails.map((service) => (
            <Card
              key={service.slug}
              name={service.name}
              url={service.url}
              slug={service.slug}
            />
          ))}
        </div>
      </div>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500">
            All links open in a new tab • Official external sources
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}