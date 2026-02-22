// src/features/forecasts/pages/Day2.tsx
import { Link } from "wouter";
import { PageLayout } from "@/shared/components/layout/PageLayout";
import { FileViewer } from "../components/FileViewer";
import { useEffect, useState } from "react";
import { useScrollToHeaderDoc } from "../components/scrollToHeaderDoc";
//import React from "react";

// Related links 
const relatedLinks = [
  { href: "/forecasts/day-3", label: "Day 3 Forecast" },
  { href: "/forecasts/day-4", label: "Day 4 Forecast" },
  { href: "/forecasts/day-5", label: "Day 5 Forecast" },
  { href: "/forecasts/risk-table-medium", label: "Medium-Range Risk Table" },
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
  
export default function DiscussionMedium() {
  const [document, setDocument] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Scroll to top on mount
  const { headerRef } = useScrollToHeaderDoc(80, !loading);
  // Fetch Latest Medium-range Risk table document
  useEffect(() => {
    fetch("/api/forecasts/latest-doc/?slug=medium-risktable")
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        if (data?.document) {
          // Django media URLs are already complete (e.g., /media/rsmc/2026/february/feb-22/file.doc)
          setDocument(data.document);
        } else {
          setError(data?.error || "Document not found");
        }
      })
      .catch(err => {
        console.error("Failed to fetch latest forecast:", err);
        setError("Failed to load document");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-10 md:py-12 lg:py-16 max-w-6xl">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Medium Range Discussion...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  return (
    <PageLayout>  {/* ← uses Header + Navbar, but skips extra hero because no title prop */}
      <div className="container mx-auto px-4 py-4 md:py-6 lg:py-8 max-w-6xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Main content area */}
          <div className="lg:col-span-9">
            <header ref={headerRef} className="mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
                Medium Range Discussion
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl">
                Monthly Medium range forecast discussion document.
              </p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {error ? (
                <div className="p-8 text-center">
                  <div className="text-red-600 mb-4">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Document Unavailable</h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <p className="text-sm text-gray-500">
                    Check back later or contact support if this persists.
                  </p>
                </div>
              ) : (              
              <FileViewer
                title="Medium Range Discussion"
                description="Monthly Medium range forecast discussion document"
                fileUrl={document || '/document.doc'}
                fileType="doc"
              />
              )}
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

