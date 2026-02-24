// src/features/forecasts/pages/Archive.tsx
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { PageLayout } from "@/shared/components/layout/PageLayout";
import { useScrollToHeaderArc } from "../components/scrollToHeaderArc";

const relatedLinks = [
  { href: "/forecasts/day-1", label: "Day 1 Forecast" },
  { href: "/forecasts/day-2", label: "Day 2 Forecast" },
  { href: "/forecasts/day-3", label: "Day 3 Forecast" },
  { href: "/forecasts/risk-table-short", label: "Short-Range Risk Table" },
  { href: "/forecasts/discussion-short", label: "Short-Range Discussion" },
];

const SidebarLink = ({
  href,
  label,
  isActive = false,
}: {
  href: string;
  label: string;
  isActive?: boolean;
}) => (
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

type FileItem = {
  name: string;
  url: string;
  type: 'image' | 'document'; // JPG vs DOC
};

export default function Archive() {
  const [years, setYears] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("forecasts"); // forecasts, discussions, tables

  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state for preview
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const { headerRef } = useScrollToHeaderArc(80);
  // 1. Fetch years
  useEffect(() => {
    setLoadingYears(true);
    fetch("/api/forecasts/archive/years/")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.years)) setYears(data.years);
      })
      .catch((err) => {
        console.error("Failed to load years:", err);
        setError("Could not load available years.");
      })
      .finally(() => setLoadingYears(false));
  }, []);

  // 2. Fetch months when year changes
  useEffect(() => {
    if (!selectedYear) {
      setMonths([]);
      setSelectedMonth("");
      return;
    }
    setLoadingMonths(true);
    fetch(`/api/forecasts/archive/months/?year=${selectedYear}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.months)) setMonths(data.months);
      })
      .catch((err) => {
        console.error("Failed to load months:", err);
        setError(`Could not load months for ${selectedYear}.`);
      })
      .finally(() => {
        setLoadingMonths(false);
        setSelectedMonth("");
        setDays([]);
        setFiles([]);
      });
  }, [selectedYear]);

  // 3. Fetch days when month changes
  useEffect(() => {
    if (!selectedYear || !selectedMonth) {
      setDays([]);
      setSelectedDay("");
      return;
    }
    setLoadingDays(true);
    fetch(`/api/forecasts/archive/days/?year=${selectedYear}&month=${selectedMonth}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.days)) setDays(data.days);
      })
      .catch((err) => {
        console.error("Failed to load days:", err);
        setError(`Could not load days for ${selectedMonth} ${selectedYear}.`);
      })
      .finally(() => {
        setLoadingDays(false);
        setSelectedDay("");
        setFiles([]);
      });
  }, [selectedYear, selectedMonth]);

  // 4. Fetch files when ALL filters are set
// 4. Fetch files - FIXED type mapping
useEffect(() => {
  if (!selectedYear || !selectedMonth || !selectedDay || !selectedType) {
    setFiles([]);
    return;
  }

  setLoadingFiles(true);
  setError(null);

  // ✅ EXACT backend parameter mapping
  
  fetch(`/api/forecasts/archive/filtered-files/?year=${selectedYear}&month=${selectedMonth}&day=${selectedDay}&type=${selectedType}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data?.files)) {
        // Backend already filtered - just detect type for display
        setFiles(data.files.map((file: any) => ({
          name: file.name,
          url: file.url,
          type: file.name.toLowerCase().match(/\.(jpg|jpeg|png)$/) ? 'image' : 'document'
        })));
      } else {
        setFiles([]);
      }
    })
    .catch(err => {
      console.error("Failed to load files:", err);
      setError(`No ${selectedType} found for ${selectedDay}/${selectedMonth}/${selectedYear}`);
    })
    .finally(() => setLoadingFiles(false));
}, [selectedYear, selectedMonth, selectedDay, selectedType]);


  const openPreview = (file: FileItem) => {
    setPreviewFile(file);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-4 md:py-6 lg:py-8 max-w-6xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-9">
            <header ref={headerRef} className="mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
                Forecast Archive
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl">
                Browse historical forecast maps (.jpg), discussions (.doc), and risk tables (.doc) by date and type.
              </p>
            </header>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border">
              <div className="min-w-[140px] flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={loadingYears}
                >
                  <option value="">Select Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[160px] flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={!selectedYear || loadingMonths}
                >
                  <option value="">Select Month</option>
                  {months.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[140px] flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  disabled={!selectedMonth || loadingDays}
                >
                  <option value="">Select Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[180px] flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  disabled={!selectedDay}
                >
                  <option value="">Select Type</option>
                  <option value="forecasts">Forecasts (.jpg)</option>
                  <option value="discussions">Discussions (.doc)</option>
                  <option value="tables">Risk Tables (.doc)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Files Grid */}
            {loadingFiles ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-xl font-medium text-gray-700">Loading files...</p>
              </div>
            ) : files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {files.map((file) => (
                  <div
                    key={file.url}
                    className="group cursor-pointer border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1"
                    onClick={() => openPreview(file)}
                  >
                    <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-8">
                          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-700 text-center px-4">{file.name}</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <p className="font-medium text-gray-900 truncate text-sm">{file.name}</p>
                      <p className="text-xs text-blue-600 mt-1">{file.type === 'image' ? 'JPG' : 'DOC'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedYear && selectedMonth && selectedDay && selectedType ? (
              <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl">📁</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No files found</h3>
                <p className="text-gray-600 max-w-md mx-auto">No {selectedType} for {selectedDay} {selectedMonth} {selectedYear}</p>
              </div>
            ) : (
              <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">Browse Archive</h3>
                <p className="text-blue-700 max-w-md mx-auto">Select year, month, day, and type to view archived forecasts, discussions, and tables.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-3 mt-12 lg:mt-0">
            <div className="sticky top-32 lg:top-40">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-blue-900 mb-5 pb-2 border-b border-gray-100">
                  Related Links
                </h3>
                <div className="space-y-1">
                  {relatedLinks.map((link) => (
                    <SidebarLink key={link.href} href={link.href} label={link.label} />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={closePreview}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
              onClick={closePreview}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1 px-4 border-b flex justify-between items-center">
            <span className="text-lg font-bold truncate">{previewFile.name}</span>
            <span className="text-blue-100 text-sm ml-2 whitespace-nowrap">
                {previewFile.type === 'image' ? 'Forecast Map' : 'Document'}
            </span>
            </div>

            {/* Content */}
            <div className="w-full h-[calc(100vh-2.5rem)]"> {/* 100vh minus header height */}
            {previewFile.type === 'image' ? (
                <img
                src={previewFile.url}
                alt={previewFile.name}
                className="w-full h-full object-contain"
                />
            ) : (
                <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewFile.url)}`}
                className="w-full h-full border-0"
                title="Document Preview"
                />
            )}
            </div>

            {/* Download button */}
            <div className="p-4 border-t bg-gray-50 flex justify-center">
              <a
                href={previewFile.url}
                download={previewFile.name}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download {previewFile.type === 'image' ? 'Image' : 'Document'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
