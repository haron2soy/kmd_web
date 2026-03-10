// src/features/forecasts/guidance/MarineDailyForecast.tsx
import { Link } from "wouter";
//import { PageLayout } from "@/shared/components/layout/PageLayout";
import { useEffect, useState } from "react";
import { useScrollToHeaderDoc } from "../components/scrollToHeaderDoc";

const relatedLinks = [
  { href: "/guidance/marine-forecast-seven-days", label: "Marine 7 Day Forecast" },
  { href: "/guidance/easwfp-discussion-daily", label: "EA SWFP Daily Forecast" },
  { href: "/guidance/archive", label: "Guidance Forecast Archive" },
];

const SidebarLink = ({ href, label, isActive = false }: { href: string; label: string; isActive?: boolean }) => (
  <Link href={href}>
    <div
      className={`block py-2.5 px-4 rounded-md text-base transition
        ${isActive
          ? "bg-blue-50 text-blue-900 font-medium border-l-4 border-blue-700 pl-3"
          : "text-gray-700 hover:text-orange-600 hover:bg-orange-50/70"
        }`}
    >
      {label}
    </div>
  </Link>
);

export default function MarineDailyForecast() {
  const [documentPath, setDocumentPath] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("docx");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { headerRef } = useScrollToHeaderDoc(80, !loading);

  useEffect(() => {
    document.title = "Forecasts | RSMC Nairobi";
    fetch("/api/forecasts/latest-doc/?slug=marine-forecast-daily")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        if (data?.document) {
          setDocumentPath(
            data.document.startsWith("/uploads/") ? data.document : `/uploads/${data.document}`
          );
          setFileType(data.file_type || "docx");
        } else {
          setError(data?.error || "Document not found");
        }
      })
      .catch(err => {
        console.error("Failed to fetch latest marine forecast:", err);
        setError("Failed to load document");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    //<PageLayout>
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="lg:grid lg:grid-cols-12 lg:gap-10">

        {/* Main content */}
        <div className="lg:col-span-9">
          <header ref={headerRef} className="mb-6">
            <h1 className="text-3xl font-serif font-bold text-primary mb-4">
              Marine Daily Forecast
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Daily marine forecast discussion document.
            </p>
          </header>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <p className="text-center py-10">Loading...</p>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-600 mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Document Unavailable</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <p className="text-sm text-gray-500">
                  Check back later or contact support if this persists.
                </p>
              </div>
            ) : documentPath ? (
              <>
                <iframe
                  src={
                    fileType === "docx" || fileType === "doc"
                      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentPath)}`
                      : documentPath
                  }
                  className="w-full h-[600px]"
                  title="Marine Forecast Document"
                />
                <div className="mt-4 flex justify-center">
                  <a
                    href={documentPath}
                    download
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Download Document
                  </a>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-3 mt-12 lg:mt-0">
          <div className="sticky top-32 lg:top-40 bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-blue-900 mb-5 pb-2 border-b border-gray-100">
              Related Links
            </h3>
            <div className="space-y-1">
              {relatedLinks.map(link => (
                <SidebarLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={link.href === "/guidance/marine-forecast-daily"}
                />
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
    //</PageLayout>
  );
}