// src/features/forecasts/pages/ArchivePage.tsx
import { Link } from "wouter";
import { PageLayout } from "@/shared/components/layout/PageLayout";

const archiveItems = [
  { date: "2026-02-10", src: "/uploads/forecasts/archive/2026-02-10.jpg" },
  { date: "2026-02-09", src: "/uploads/forecasts/archive/2026-02-09.jpg" },
  { date: "2026-02-10", src: "/uploads/forecasts/archive/2026-02-10.jpg" },
  { date: "2026-02-09", src: "/uploads/forecasts/archive/2026-02-09.jpg" },
  // { date: "2026-02-08", src: "/uploads/forecasts/archive/2026-02-08.jpg" },
  // add more dynamically in future
];

// Related links (same list as in Day1/Day2, but no active item on archive page)
const relatedLinks = [
  { href: "/forecasts/day-1", label: "Day 1 Forecast" },
  { href: "/forecasts/day-3", label: "Day 3 Forecast" },
  { href: "/forecasts/risk-table-short", label: "Short-Range Risk Table" },
  { href: "/forecasts/discussion-short", label: "Short-Range Discussion" },

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

export default function ArchivePage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10 md:py-12 lg:py-16 max-w-6xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Main content area */}
          <div className="lg:col-span-9">
            <header className="mb-10 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
                Forecast Archive
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl">
                Access past forecasts by upload date. Click on any date to view the archived forecast map.
              </p>
            </header>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {archiveItems.map((item) => (
                <a
                  key={item.date}
                  href={item.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.src}
                      alt={`Forecast archive for ${item.date}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 text-center font-medium text-gray-900">
                    {item.date}
                  </div>
                </a>
              ))}

              {/* Placeholder for empty state or future items */}
              {archiveItems.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No archived forecasts available yet.
                </div>
              )}
            </div>
          </div>

          {/* Related Links sidebar */}
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