// src/features/forecasts/pages/Day1.tsx
import { Link } from "wouter";
import { PageLayout } from "@/shared/components/layout/PageLayout";
import { ImageViewer } from "../components/ImageViewer";
import { useEffect, useState } from "react";

// Sidebar links
const relatedLinks = [
  { href: "/forecasts/day-2", label: "Day 2 Forecast" },
  { href: "/forecasts/risk-table-short", label: "Short-Range Risk Table" },
  { href: "/forecasts/discussion-short", label: "Short-Range Discussion" },
  { href: "/forecasts/archive", label: "Forecast Archive" },
];

// Sidebar link component
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

export default function Day1() {
  const [image, setImage] = useState<string | null>(null);

  // Fetch latest Day 1 forecast from Django
  useEffect(() => {
    fetch("/api/forecasts/latest/?day=1")
      .then(res => res.json())
      .then(data => {
        if (data?.image) {
          // Ensure image points to /uploads/... for Nginx
          setImage(data.image.startsWith("/uploads/") ? data.image : `/uploads/${data.image}`);
        }
      })
      .catch(err => console.error("Failed to fetch latest forecast:", err));
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10 md:py-12 lg:py-16 max-w-6xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Main content */}
          <div className="lg:col-span-9">
            <header className="mb-10 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
                Short Range Forecast – Day 1
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl">
                Daily forecast map and key weather highlights for Day 1.
              </p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <ImageViewer
                src={image || "/fallback.jpg"} // fallback if no image yet
                alt="Short Range Forecast – Day 1"
              />
            </div>
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
                    <SidebarLink
                      key={link.href}
                      href={link.href}
                      label={link.label}
                      isActive={false} // you can mark Day1 as active if needed
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