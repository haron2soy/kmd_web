// src/features/forecasts/pages/Archive.tsx
import { useEffect, useState } from "react";
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
};

export default function Archive() {
  const [years, setYears] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");

  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Fetch available years once on mount
  useEffect(() => {
    setLoadingYears(true);
    setError(null);

    fetch("/api/forecasts/archive/years/")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.years)) {
          setYears(data.years);
        } else {
          setError("Invalid response format for years");
        }
      })
      .catch((err) => {
        console.error("Failed to load years:", err);
        setError("Could not load available years. Please try again later.");
      })
      .finally(() => setLoadingYears(false));
  }, []);

  // Fetch months when year changes
  useEffect(() => {
    if (!selectedYear) {
      setMonths([]);
      setSelectedMonth("");
      return;
    }

    setLoadingMonths(true);
    setError(null);
    setMonths([]);
    setSelectedMonth("");
    setDays([]);
    setSelectedDay("");
    setFiles([]);

    fetch(`/api/forecasts/archive/months/?year=${selectedYear}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.months)) {
          setMonths(data.months);
        } else {
          setError("Invalid response format for months");
        }
      })
      .catch((err) => {
        console.error("Failed to load months:", err);
        setError(`Could not load months for ${selectedYear}.`);
      })
      .finally(() => setLoadingMonths(false));
  }, [selectedYear]);

  // Fetch days when month changes
  useEffect(() => {
    if (!selectedYear || !selectedMonth) {
      setDays([]);
      setSelectedDay("");
      return;
    }

    setLoadingDays(true);
    setError(null);
    setDays([]);
    setSelectedDay("");
    setFiles([]);

    fetch(`/api/forecasts/archive/days/?year=${selectedYear}&month=${selectedMonth}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.days)) {
          setDays(data.days);
        } else {
          setError("Invalid response format for days");
        }
      })
      .catch((err) => {
        console.error("Failed to load days:", err);
        setError(`Could not load days for ${selectedMonth} ${selectedYear}.`);
      })
      .finally(() => setLoadingDays(false));
  }, [selectedYear, selectedMonth]);

  // Fetch files when day changes
  useEffect(() => {
    if (!selectedYear || !selectedMonth || !selectedDay) {
      setFiles([]);
      return;
    }

    setLoadingFiles(true);
    setError(null);
    setFiles([]);

    fetch(
      `/api/forecasts/archive/files/?year=${selectedYear}&month=${selectedMonth}&day=${selectedDay}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data?.files)) {
          setFiles(data.files);
        } else {
          setError("Invalid response format for files");
        }
      })
      .catch((err) => {
        console.error("Failed to load files:", err);
        setError(`Could not load forecast files for ${selectedDay}/${selectedMonth}/${selectedYear}.`);
      })
      .finally(() => setLoadingFiles(false));
  }, [selectedYear, selectedMonth, selectedDay]);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10 md:py-12 lg:py-16 max-w-6xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-9">
            <header className="mb-10 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
                Forecast Archive
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl">
                Browse historical forecast maps by selecting a year, month, and day below.
              </p>
            </header>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="min-w-[140px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={loadingYears}
                >
                  <option value="">Select Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                {loadingYears && <p className="text-sm text-blue-600 mt-1">Loading years...</p>}
              </div>

              <div className="min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={!selectedYear || loadingMonths || months.length === 0}
                >
                  <option value="">Select Month</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {loadingMonths && <p className="text-sm text-blue-600 mt-1">Loading months...</p>}
              </div>

              <div className="min-w-[140px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  disabled={!selectedMonth || loadingDays || days.length === 0}
                >
                  <option value="">Select Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {loadingDays && <p className="text-sm text-blue-600 mt-1">Loading days...</p>}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Files / Results */}
            {loadingFiles ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading forecast files...</p>
              </div>
            ) : files.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {files.map((file) => (
                  <a
                    key={file.url}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 bg-white"
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 text-center font-medium text-gray-900 truncate">
                      {file.name}
                    </div>
                  </a>
                ))}
              </div>
            ) : selectedYear && selectedMonth && selectedDay ? (
              <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-lg font-medium">No forecast files available for this date.</p>
                <p className="mt-2">Try selecting a different day or check back later.</p>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-lg">Select a year, month, and day to browse archived forecasts.</p>
              </div>
            )}
          </div>

          {/* Sidebar – unchanged */}
          <aside className="lg:col-span-3 mt-12 lg:mt-0">
            <div className="sticky top-32 lg:top-40">
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
                      isActive={false} // can make dynamic later if needed
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