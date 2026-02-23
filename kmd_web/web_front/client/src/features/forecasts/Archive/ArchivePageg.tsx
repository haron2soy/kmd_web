// src/features/forecasts/Archive/ArchivePage.tsx
import { useEffect, useState } from "react";
import { PageLayout } from "@/shared/components/layout/PageLayout";

type FileItem = {
  name: string;
  url: string;
};

export default function ArchivePage() {
  const [years, setYears] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const [loading, setLoading] = useState(false);

  // ---------------------------
  // Fetch years
  // ---------------------------
  useEffect(() => {
    fetch("/api/forecasts/archive/years/")
      .then(res => res.json())
      .then(data => setYears(data.years || []))
      .catch(err => console.error("Years fetch error:", err));
  }, []);

  // ---------------------------
  // Fetch months
  // ---------------------------
  useEffect(() => {
    if (!year) return;

    setMonth("");
    setDay("");
    setFiles([]);

    fetch(`/api/forecasts/archive/months/?year=${year}`)
      .then(res => res.json())
      .then(data => setMonths(data.months || []))
      .catch(err => console.error("Months fetch error:", err));
  }, [year]);

  // ---------------------------
  // Fetch days
  // ---------------------------
  useEffect(() => {
    if (!year || !month) return;

    setDay("");
    setFiles([]);

    fetch(`/api/forecasts/archive/days/?year=${year}&month=${month}`)
      .then(res => res.json())
      .then(data => setDays(data.days || []))
      .catch(err => console.error("Days fetch error:", err));
  }, [month]);

  // ---------------------------
  // Fetch files
  // ---------------------------
  useEffect(() => {
    if (!year || !month || !day) return;

    setLoading(true);

    fetch(`/api/forecasts/archive/files/?year=${year}&month=${month}&day=${day}`)
      .then(res => res.json())
      .then(data => setFiles(data.files || []))
      .catch(err => console.error("Files fetch error:", err))
      .finally(() => setLoading(false));
  }, [day]);

  // ---------------------------
  // Helpers
  // ---------------------------
  const isImage = (name: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(name);

  const isDoc = (name: string) =>
    /\.(pdf|doc|docx)$/i.test(name);

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-serif font-bold text-primary mb-4">
            Forecast Archive
          </h1>
          <p className="text-lg text-gray-600">
            Browse historical forecasts by date.
          </p>
        </header>

        {/* Selectors */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Year */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="p-3 border rounded-lg bg-white shadow-sm"
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>

          {/* Month */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            disabled={!year}
            className="p-3 border rounded-lg bg-white shadow-sm"
          >
            <option value="">Select Month</option>
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          {/* Day */}
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            disabled={!month}
            className="p-3 border rounded-lg bg-white shadow-sm"
          >
            <option value="">Select Day</option>
            {days.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div className="bg-white border rounded-xl p-6 shadow-sm min-h-[300px]">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4 rounded-full" />
              <p className="text-gray-600">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No files available for selected date.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {files.map((file) => (
                <div
                  key={file.url}
                  className="border rounded-lg overflow-hidden shadow-sm"
                >
                  {/* Image Preview */}
                  {isImage(file.name) && (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-auto object-cover"
                    />
                  )}

                  {/* Document Preview */}
                  {isDoc(file.name) && (
                    <div className="p-4 flex flex-col gap-3">
                      <p className="font-medium text-gray-800">
                        {file.name}
                      </p>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Preview / Open
                      </a>

                      <a
                        href={file.url}
                        download
                        className="text-sm text-gray-500 hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}