// src/features/forecasts/pages/Archive.tsx
/*import { useEffect, useState } from "react";
import { Link } from "wouter";
import { PageLayout } from "@/shared/components/layout/PageLayout";

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
    // TypeScript helper functions
    const downloadFile = useCallback((file: FileItem): void => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    }, []);

    const navigateFile = useCallback((direction: number): void => {
    if (!previewFile || files.length <= 1) return;
    
    const imageFiles = files.filter((f): f is FileItem => f.type === 'image');
    const currentIndex = imageFiles.findIndex((f) => f.url === previewFile.url);
    
    if (currentIndex === -1) return;
    
    const newIndex = (currentIndex + direction + imageFiles.length) % imageFiles.length;
    setPreviewFile(imageFiles[newIndex]);
    setCurrentFileIndex(newIndex);
    }, [previewFile, files]);

    const openPreview = useCallback((file: FileItem): void => {
    const imageFiles = files.filter((f): f is FileItem => f.type === 'image');
    const index = imageFiles.findIndex((f) => f.url === file.url);
    setCurrentFileIndex(Math.max(0, index));
    setPreviewFile(file);
    }, [files]);

    const closePreview = useCallback((): void => {
    setPreviewFile(null);
    setCurrentFileIndex(0);
    }, []);
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10 md:py-12 lg:py-16 max-w-6xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Main Content *}
          <div className="lg:col-span-9">
            <header className="mb-10 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
                Forecast Archive
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl">
                Browse historical forecast maps (.jpg), discussions (.doc), and risk tables (.doc) by date and type.
              </p>
            </header>

            {/* Filters *}
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

            {/* Files Grid *}
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

          {/* Sidebar *}
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

      {/* ✅ TypeScript Preview Modal *}
{previewFile && files.length > 0 && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
    onClick={closePreview}
  >
    <div
      className="relative max-w-6xl max-h-[95vh] w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      {/* Close button *}
      <button
        type="button"
        className="absolute top-6 right-6 z-20 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all hover:scale-110"
        onClick={closePreview}
        aria-label="Close preview"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>


      {/* Navigation Arrows - Images only *}
      {previewFile.type === 'image' && files.filter((f) => f.type === 'image').length > 1 && (
        <>
          <button
            type="button"
            onClick={() => navigateFile(-1)}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-4 transition-all hover:scale-110"
            aria-label="Previous image"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => navigateFile(1)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-4 transition-all hover:scale-110"
            aria-label="Next image"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Header *}
      <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white py-4 px-6 border-b border-gray-700 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-bold truncate max-w-xs">{previewFile.name}</span>
          <span className="text-gray-300 text-sm bg-black/30 px-3 py-1 rounded-full">
            {previewFile.type === 'image' ? 'JPG Map' : 'Word Document'}
            {files.filter((f) => f.type === 'image').length > 1 && previewFile.type === 'image' && (
              <span className="ml-2 text-xs">
                ({currentFileIndex + 1} of {files.filter((f) => f.type === 'image').length})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Content *}
      <div className="flex-1 min-h-0 overflow-hidden">
        {previewFile.type === 'image' ? (
          <div className="w-full h-full flex items-center justify-center p-8 bg-gray-900">
            <img
              src={previewFile.url}
              alt={previewFile.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              loading="eager"
            />
          </div>
        ) : (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewFile.url)}`}
            className="w-full h-full border-0 bg-white"
            title={`Preview of ${previewFile.name}`}
            allowFullScreen
          />
        )}
      </div>

      {/* Footer - Download Button ALWAYS VISIBLE *}
      <div className="p-6 border-t bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center space-x-4">
        <button
          type="button"
          onClick={() => downloadFile(previewFile)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3 hover:scale-[1.02]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download {previewFile.type === 'image' ? 'Image' : 'Document'}</span>
        </button>
        
        {files.filter((f) => f.type === 'image').length > 1 && previewFile.type === 'image' && (
          <div className="text-sm text-gray-600 font-medium">
            {currentFileIndex + 1} / {files.filter((f) => f.type === 'image').length}
          </div>
        )}
      </div>
    </div>
  </div>
)}

    </PageLayout>
  );
}*/
