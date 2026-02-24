// src/features/met-services/MetServicesLanding.tsx
import { PageLayout } from "@/shared/components/layout/PageLayout";
import { useScrollToHeader } from "@/shared/components/ScrollToHeader/useScrollToHeader";
import type { ServiceItem } from "./services"; // import central config
import {services} from "./services";
const Card = ({ name, slug }: ServiceItem) => (
  <a
    href={`/national/${slug}`}       // use the route, redirect page handles new tab
    target="_blank"                 // open in new tab
    rel="noopener noreferrer"
    className="group block p-6 border rounded-lg bg-white hover:shadow-md hover:border-primary/40 transition"
  >
    <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary">
      {name}
    </h3>
    <p className="text-sm text-gray-500 mt-2">
      Visit national meteorological service →
    </p>
  </a>
);

export default function NationalMetServicesLanding() {
  const { headerRef } = useScrollToHeader(80);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <header ref={headerRef} className="mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
            National Meteorological Services
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Access official websites of National Meteorological Services across the region.
          </p>
        </header>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.slug} {...service} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}