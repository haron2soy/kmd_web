// src/features/forecasts/pages/Archive.tsx

import { useEffect, useState } from "react";
import { Link } from "wouter";
import apiClient from "@/lib/apiClient";
import { useScrollToHeaderArc } from "../components/scrollToHeaderArc";

type FileItem = {
  name: string;
  url: string;
  type: "image" | "document";
};

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
}: {
  href: string;
  label: string;
}) => (
  <Link href={href}>
    <div className="block py-2.5 px-4 rounded-md transition-colors text-base text-gray-700 hover:text-orange-600 hover:bg-orange-50/70 cursor-pointer">
      {label}
    </div>
  </Link>
);

export default function Archive() {
  const { headerRef } = useScrollToHeaderArc(80);

  const [years, setYears] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedType, setSelectedType] = useState("forecasts");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  /* --------------------------------------------------
     Helper
  -------------------------------------------------- */
  const detectFileType = (name: string): "image" | "document" =>
    /\.(jpg|jpeg|png)$/i.test(name) ? "image" : "document";

  const resetBelowYear = () => {
    setMonths([]);
    setDays([]);
    setFiles([]);
    setSelectedMonth("");
    setSelectedDay("");
  };

  const resetBelowMonth = () => {
    setDays([]);
    setFiles([]);
    setSelectedDay("");
  };

  /* --------------------------------------------------
     Fetch Years (on mount)
  -------------------------------------------------- */
  useEffect(() => {
    document.title = "Forecasts | RSMC Nairobi";
    const fetchYears = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get("/forecasts/archive/years/");
        if (Array.isArray(data?.years)) setYears(data.years);
      } catch (err) {
        console.error(err);
        setError("Could not load available years.");
      } finally {
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  /* --------------------------------------------------
     Fetch Months
  -------------------------------------------------- */
  useEffect(() => {
    if (!selectedYear) {
      resetBelowYear();
      return;
    }

    const fetchMonths = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(
          `/forecasts/archive/months/?year=${selectedYear}`
        );
        if (Array.isArray(data?.months)) setMonths(data.months);
        resetBelowMonth();
      } catch (err) {
        console.error(err);
        setError(`Could not load months for ${selectedYear}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchMonths();
  }, [selectedYear]);

  /* --------------------------------------------------
     Fetch Days
  -------------------------------------------------- */
  useEffect(() => {
    if (!selectedYear || !selectedMonth) {
      resetBelowMonth();
      return;
    }

    const fetchDays = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get(
          `/forecasts/archive/days/?year=${selectedYear}&month=${selectedMonth}`
        );
        if (Array.isArray(data?.days)) setDays(data.days);
        setFiles([]);
        setSelectedDay("");
      } catch (err) {
        console.error(err);
        setError(
          `Could not load days for ${selectedMonth} ${selectedYear}.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDays();
  }, [selectedYear, selectedMonth]);

  /* --------------------------------------------------
     Fetch Files
  -------------------------------------------------- */
  useEffect(() => {
    if (!selectedYear || !selectedMonth || !selectedDay || !selectedType) {
      setFiles([]);
      return;
    }

    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await apiClient.get(
          `/forecasts/archive/filtered-files/?year=${selectedYear}&month=${selectedMonth}&day=${selectedDay}&type=${selectedType}`
        );

        if (Array.isArray(data?.files)) {
          setFiles(
            data.files.map((file: any) => ({
              name: file.name,
              url: file.url,
              type: detectFileType(file.name),
            }))
          );
        } else {
          setFiles([]);
        }
      } catch (err) {
        console.error(err);
        setError(
          `No ${selectedType} found for ${selectedDay}/${selectedMonth}/${selectedYear}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [selectedYear, selectedMonth, selectedDay, selectedType]);

  /* --------------------------------------------------
     Modal UX Improvements
  -------------------------------------------------- */
  useEffect(() => {
    if (!previewFile) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewFile(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [previewFile]);

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="lg:grid lg:grid-cols-12 lg:gap-10">
        {/* MAIN */}
        <div className="lg:col-span-9">
          <header ref={headerRef} className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-primary mb-4">
              Forecast Archive
            </h1>
            <p className="text-gray-600">
              Browse historical forecasts, discussions, and risk tables.
            </p>
          </header>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border">
            <Select
              label="Year"
              value={selectedYear}
              onChange={setSelectedYear}
              options={years}
              disabled={loading}
            />
            <Select
              label="Month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={months}
              disabled={!selectedYear || loading}
            />
            <Select
              label="Day"
              value={selectedDay}
              onChange={setSelectedDay}
              options={days}
              disabled={!selectedMonth || loading}
            />
            <Select
              label="Type"
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { label: "Forecasts (.jpg)", value: "forecasts" },
                { label: "Discussions (.doc)", value: "discussions" },
                { label: "Risk Tables (.doc)", value: "tables" },
              ]}
              disabled={!selectedDay}
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Files */}
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : files.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {files.map((file) => (
                <div
                  key={file.url}
                  onClick={() => setPreviewFile(file)}
                  className="cursor-pointer border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition"
                >
                  {file.type === "image" ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="h-40 flex items-center justify-center bg-gray-100">
                      <span>📄</span>
                    </div>
                  )}
                  <div className="p-3 text-sm font-medium truncate">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select filters to view files.
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-3 mt-12 lg:mt-0">
          <div className="sticky top-32 bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              Related Links
            </h3>
            {relatedLinks.map((link) => (
              <SidebarLink key={link.href} {...link} />
            ))}
          </div>
        </aside>
      </div>

      {/* MODAL */}
      {previewFile && (
        <div
          onClick={() => setPreviewFile(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {previewFile.type === "image" ? (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="w-full h-[80vh] object-contain"
              />
            ) : (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                  previewFile.url
                )}`}
                className="w-full h-[80vh]"
                title="Document Preview"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------
   Reusable Select Component
-------------------------------------------------- */

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options:
    | string[]
    | { label: string; value: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="min-w-[140px] flex-1">
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>
      <select
        className="w-full border rounded-lg px-4 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select {label}</option>
        {options.map((opt: any) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}