// src/features/swfp/quarterlyreport/QuarterlyReport.tsx
import { Link } from "wouter";
import { PageLayout } from "@/shared/components/layout/PageLayout";
import { useEffect, useState } from "react";
import { useScrollToHeader } from "../../../shared/components/ScrollToHeader/useScrollToHeader";

const relatedLinks = [
  { href: "/swfp-evaluation", label: "SWFP Landing" },
  { href: "/swfp-evaluation/event-table", label: "Event Table" },
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
      className={`block py-2.5 px-4 rounded-md text-base transition
        ${isActive
          ? "bg-blue-50 text-blue-900 font-medium border-l-4 border-blue-700 pl-3"
          : "text-gray-700 hover:text-orange-600 hover:bg-orange-50/70"}
      `}
    >
      {label}
    </div>
  </Link>
);

export default function QuarterlyReport() {
  const [file, setFile] = useState<string | null>(null);
  const { headerRef } = useScrollToHeader(80);
  const year = 2026;
  const quarter = 1;

  useEffect(() => {
    fetch(`/api/swfp_evaluation/reports/quarterly/?year=${year}&quarter=${quarter}`)
      .then(res => res.json())
      .then(data => {
        if (data?.file) {
          setFile(data.file.startsWith("/uploads/")
            ? data.file
            : `/uploads/${data.file}`);
        }
      });
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">

          {/* Main */}
          <div className="lg:col-span-9">
            <header ref={headerRef} className="mb-6">
              <h1 className="text-3xl font-serif font-bold text-primary mb-3">
                Quarterly Report
              </h1>
              <p className="text-gray-600">
                Official SWFP Quarterly Report.
              </p>
            </header>

            <div className="bg-white border rounded-xl p-4">
              {file ? (
                <>
                  <iframe src={file} className="w-full h-[600px]" />
                  <div className="mt-4 flex justify-center">
                    <a href={file} download className="px-5 py-2 bg-blue-600 text-white rounded-lg">
                      Download PDF
                    </a>
                  </div>
                </>
              ) : (
                <p className="text-center py-10">Loading...</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-3 mt-10 lg:mt-0">
            <div className="sticky top-32">
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-blue-900 mb-5 border-b pb-2">
                  Related Links
                </h3>
                {relatedLinks.map(link => (
                  <SidebarLink
                    key={link.href}
                    {...link}
                    isActive={link.href === "/swfp-evaluation/quarterly-report"}
                  />
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </PageLayout>
  );
}