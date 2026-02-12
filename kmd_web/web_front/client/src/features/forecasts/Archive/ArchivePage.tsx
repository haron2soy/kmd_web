//import React from "react";
import { PageLayout } from "@/shared/components/layout/PageLayout";

const archiveItems = [
  { date: "2026-02-10", src: "/uploads/forecasts/archive/2026-02-10.jpg" },
  { date: "2026-02-09", src: "/uploads/forecasts/archive/2026-02-09.jpg" },
  // add more dynamically in future
];

export default function ArchivePage() {
  return (
    <PageLayout
      title="Forecast Archive"
      description="Access past forecasts by upload date"
    >
      <div className="container mx-auto px-4 py-10 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {archiveItems.map(item => (
          <a key={item.date} href={item.src} target="_blank" rel="noopener noreferrer">
            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <img src={item.src} alt={`Forecast ${item.date}`} className="w-full h-40 object-cover" />
              <div className="p-2 text-center font-medium">{item.date}</div>
            </div>
          </a>
        ))}
      </div>
    </PageLayout>
  );
}
