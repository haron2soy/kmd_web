// src/features/met-services/pages/RedirectRegionalInternational.tsx
import { useEffect } from "react";
import { useLocation } from "wouter";
import { ProductDetails } from "../Global/ProductDetails";

export default function RedirectProducts() {
  const path = useLocation()[0]; // current path
  const slug = path.replace(/^\/products\//, "");
  const service = ProductDetails.find((s) => s.slug === slug);

  useEffect(() => {
    if (service) {
      // Redirect immediately to the official site
      window.location.href = service.url;
    }
  }, [service]);

  if (!service) {
    return (
      <div className="p-10 text-center text-gray-600 min-h-screen flex items-center justify-center">
        Service not found
      </div>
    );
  }

  // Optionally, you can show a tiny "Redirecting..." message while the browser navigates
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <p className="text-gray-500">Redirecting to {service.name}...</p>
    </div>
  );
}