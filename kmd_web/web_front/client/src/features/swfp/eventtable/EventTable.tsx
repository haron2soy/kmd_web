// src/features/swfp/eventtable/EventTable.tsx
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useScrollToHeader } from "../../../shared/components/ScrollToHeader/useScrollToHeader";

const QuickLinks = [
  { href: "/swfp-evaluation", label: "SWFP Landing" },
  { href: "/swfp-evaluation/quarterly-report", label: "Quarterly Report" },
  { href: "/swfp-evaluation/event-table", label: "Event Table" },
];

export default function EventTable() {
  const [file, setFile] = useState<string | null>(null);
  const { headerRef } = useScrollToHeader(80);

  const year = 2026;
  const quarter = 1;

  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/swfp_evaluation/events-table/?year=${year}&quarter=${quarter}`)
      .then(res => res.json())
      .then(data => {
        if (data?.file) {
          setFile(
            data.file.startsWith("/uploads/")
              ? data.file
              : `/uploads/${data.file}`
          );
        }
      });

    fetch(`/api/swfp_evaluation/events-table-data/?year=${year}&quarter=${quarter}`)
      .then(res => res.json())
      .then(data => {
        if (data?.columns && data?.rows) {
          setColumns(data.columns);
          setRows(data.rows);
        }
      });
  }, []);

  return (
    <div className="mx-auto px-4 max-w-7xl">

      {/* SAME GRID AS NWP */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">

        {/* QUICK LINKS (LEFT SIDEBAR - IDENTICAL TO NWP) */}
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
                          link.href === "/swfp-evaluation/event-table"
                            ? "bg-orange-50 text-orange-600"
                            : "hover:bg-orange-50 hover:text-orange-600"
                        }
                      `}
                    >
                      {link.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-9 w-full flex flex-col">

          <header ref={headerRef} className="mb-4 md:mb-4">
            <h1 className="text-xl md:text-2xl font-serif font-bold text-primary mb-10">
              Event Table
            </h1>
            <p className="text-gray-600">
              SWFP event verification dataset.
            </p>
          </header>

          {/* TABLE */}
          {rows.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="px-3 py-2 border text-left">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {columns.map((col) => (
                        <td key={col} className="px-3 py-2 border">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* DOWNLOAD */}
          <div className="bg-white border rounded-xl p-4 mt-6">
            {file ? (
              <div className="flex justify-center">
                <a
                  href={file}
                  download
                  className="px-5 py-2 bg-green-600 text-white rounded-lg"
                >
                  Download Excel
                </a>
              </div>
            ) : (
              <p className="text-center py-10">Loading...</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}