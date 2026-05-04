// src/features/swfp/quarterlyreport/QuarterlyReport.tsx

import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useScrollToHeader } from "../../../shared/components/ScrollToHeader/useScrollToHeader";
import FilePreviewModal from "@/features/forecasts/components/FilePreviewModal";

export default function QuarterlyReport() {
  const [files, setFiles] = useState<
    { name: string; url: string; type: "image" | "document" }[]
  >([]);

  const [previewFileIndex, setPreviewFileIndex] = useState<number | null>(null);

  const { headerRef } = useScrollToHeader([], 80);

  const year = 2026;
  const quarter = 1;

  useEffect(() => {
    fetch(`/api/swfp_evaluation/reports/quarterly/?year=${year}&quarter=${quarter}`)
      .then(res => res.json())
      .then(data => {
        if (data?.file) {
          const url = data.file.startsWith("/uploads/")
            ? data.file
            : `/uploads/${data.file}`;

          setFiles([
            {
              name: `Quarterly_Report_Q${quarter}_${year}.pdf`,
              url,
              type: "document",
            },
          ]);
        }
      });
  }, []);

  // ✅ FULL APP QUICK LINKS (no more related links)
  const QuickLinks = [
    { href: "/forecasts/risk-table-short", label: "Short-Range Risk Table" },
    { href: "/forecasts/discussion-short", label: "Short-Range Discussion" },
    { href: "/forecasts/risk-table-medium", label: "Medium-Range Risk Table" },
    { href: "/forecasts/discussion-medium", label: "Medium-Range Discussion" },
    { href: "/guidance", label: "Guidance" },
    { href: "/nwp-models", label: "NWP Models" },
    { href: "/forecasts/archive", label: "Forecast Archive" },

    // SWFP section included here
    { href: "/swfp-evaluation", label: "SWFP Landing" },
    { href: "/swfp-evaluation/quarterly-report", label: "Quarterly Report" },
    { href: "/swfp-evaluation/event-table", label: "Event Table" },
  ];

  const currentPath = window.location.pathname;

  return (
    <div className="mx-auto px-4 max-w-7xl">

      {/* ✅ NWP GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">

        {/* ✅ LEFT SIDEBAR */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-20">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Quick Links
              </h3>

              <div className="space-y-2">
                {QuickLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div
                      className={`py-1 px-3 rounded cursor-pointer
                        ${
                          currentPath === link.href
                            ? "bg-orange-50 text-orange-600"
                            : "hover:bg-orange-50 hover:text-orange-600"
                        }`}
                    >
                      {link.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ✅ MAIN */}
        <div className="lg:col-span-9 w-full flex flex-col">

          <header ref={headerRef} className="mb-4 md:mb-4">
            <h1 className="text-xl md:text-2xl font-serif font-bold text-primary mb-10">
              Quarterly Report
            </h1>
            <p className="text-gray-600">
              Official SWFP Quarterly Report.
            </p>
          </header>

          <div className="bg-white border rounded-xl p-6 text-center">
            {files.length > 0 ? (
              <>
                <button
                  onClick={() => setPreviewFileIndex(0)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Open Report
                </button>

                <div className="mt-4">
                  <a
                    href={files[0].url}
                    download
                    className="px-5 py-2 bg-gray-700 text-white rounded-lg"
                  >
                    Download PDF
                  </a>
                </div>
              </>
            ) : (
              <p className="text-center py-10">Loading...</p>
            )}
          </div>

        </div>
      </div>

      <FilePreviewModal
        previewFileIndex={previewFileIndex}
        setPreviewFileIndex={setPreviewFileIndex}
        files={files}
      />
    </div>
  );
}