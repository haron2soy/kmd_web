// src/features/forecasts/pages/Day2.tsx
import { Link } from "wouter";
import { PageLayout } from "@/shared/components/layout/PageLayout";
import { FileViewer } from "../components/FileViewer";
//import React from "react";
  
  // Assume uploaded to /uploads/forecasts/short-range/risk_table_-short.doc
const FILE_PATH = "/uploads/forecasts/short-range/risk_table_short.doc";
  
  // Related links 
  const relatedLinks = [
    { href: "/forecasts/day-1", label: "Day 1 Forecast" },
    { href: "/forecasts/day-2", label: "Day 2 Forecast" },
    { href: "/forecasts/discussion-short", label: "Short-Range Discussion" },
    { href: "/forecasts/archive", label: "Forecast Archive" },
  ];
  
  const SidebarLink = ({ href, label, isActive = false }: { href: string; label: string; isActive?: boolean }) => (
    <Link href={href}>
      <div
        className={`
          block py-2.5 px-4 rounded-md transition-colors text-base
          ${isActive
            ? "bg-blue-50 text-blue-900 font-medium border-l-4 border-blue-700 pl-3"
            : "text-gray-700 hover:text-orange-600 hover:bg-orange-50/70"
          }
        `}
      >
        {label}
      </div>
    </Link>
  );
  
  export default function RiskTableShort() {
    return (
      <PageLayout>  {/* ← uses Header + Navbar, but skips extra hero because no title prop */}
        <div className="container mx-auto px-4 py-10 md:py-12 lg:py-16 max-w-6xl">
          <div className="lg:grid lg:grid-cols-12 lg:gap-10">
            {/* Main content area */}
            <div className="lg:col-span-9">
              <header className="mb-10 md:mb-12">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
                  Risk Table Short Range
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl">
                  Monthly short range forecast risk table document.
                </p>
              </header>
  
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <FileViewer
                  title="Short Range Risk Table"
                  description="Monthly short range forecast risk table document"
                  fileUrl={FILE_PATH}
                  fileType="doc"
                />
              </div>
            </div>
  
            {/* Related Links sidebar */}
            <aside className="lg:col-span-3 mt-12 lg:mt-0">
              <div className="sticky top-32 lg:top-40"> {/* ← adjust this value based on your Header + Navbar height */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-blue-900 mb-5 pb-2 border-b border-gray-100">
                    Related Links
                  </h3>
                  <div className="space-y-1">
                    {relatedLinks.map((link) => (
                      <SidebarLink
                        key={link.href}
                        href={link.href}
                        label={link.label}
                        
                      />
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </PageLayout>
    );
  }

