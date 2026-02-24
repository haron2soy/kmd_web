// src/features/met-services/pages/RedirectRegionalInternational.tsx
import { useLocation } from "wouter";
import { RegionalInternational } from "../RegionalInternational";

export default function RedirectRegionalInternational() {
  const path = useLocation()[0]; // current path
  const slug = path.replace(/^\/regional-international\//, "");
  const service = RegionalInternational.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="p-10 text-center text-gray-600 min-h-screen flex items-center justify-center">
        Service not found
      </div>
    );
  }

  const handleClick = () => {
    // Open official site in a new tab
    window.open(service.url, "_blank", "noopener,noreferrer");

    // Close this redirect tab
    window.close();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Go to {service.name}</h1>

      <button
        onClick={handleClick}
        className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow transition"
      >
        Visit {service.name} →
      </button>

      <p className="mt-8 text-gray-500 text-sm text-center max-w-sm">
        Click the button above to open the official website. This tab will close automatically.
      </p>
    </div>
  );
}