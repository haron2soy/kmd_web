// src/features/nwp/pages/NWPLanding.tsx
import { useQuery } from "@tanstack/react-query";
import { getNWPModels } from "../api";
import { useEffect } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useScrollToHeader } from "@/shared/components/ScrollToHeader/useScrollToHeader";
// -------------------------------
// Match backend contract
// -------------------------------
interface NWPModel {
  id: string | number;
  name: string;
  description?: string;
  status?: "pending" | "live" | "deprecated";

  // backend-provided
  apiEndpoint: string;
  variables?: string[];
  days?: { id: string; label: string; prefix: string }[];
}

// -------------------------------
// Model Card
// -------------------------------
const ModelCard = ({ model }: { model: NWPModel }) => {
  const isPending = model.status === "pending";

  const content = (
    <div
      className={`group relative p-6 border border-gray-200 rounded-lg bg-white transition-all duration-200
        ${
          isPending
            ? "opacity-80 cursor-not-allowed"
            : "hover:shadow-md hover:border-primary/40 cursor-pointer"
        }`}
    >
      {/* hover glow */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Title */}
      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors mb-3">
        {model.name}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
        {model.description || "No description available."}
      </p>

      {/* Status */}
      {model.status && (
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
            model.status === "pending"
              ? "text-yellow-800 bg-yellow-50"
              : model.status === "live"
              ? "text-emerald-700 bg-emerald-50"
              : "text-gray-700 bg-gray-100"
          }`}
        >
          {model.status === "pending" && "Pending"}
          {model.status === "live" && "Live"}
          {model.status === "deprecated" && "Deprecated"}
        </span>
      )}

      {/* CTA */}
      {!isPending && (
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mt-2">
          <Clock className="h-3.5 w-3.5" />
          <span>View model</span>
        </div>
      )}
    </div>
  );

  // ✅ Always route using model ID
  return isPending ? content : <Link href={`/nwp-models/${model.id}`}>{content}</Link>;
};

// -------------------------------
// Skeleton
// -------------------------------
const ModelSkeleton = () => (
  <div className="p-6 border border-gray-200 rounded-lg bg-white">
    <Skeleton className="h-6 w-3/4 mb-3" />
    <Skeleton className="h-16 w-full mb-4" />
    <Skeleton className="h-5 w-32" />
  </div>
);

// -------------------------------
// Page
// -------------------------------
export default function NWPLanding() {
  const {headerRef} = useScrollToHeader([], 80)
  useEffect(() => {
    document.title = "NWP | RSMC Nairobi";
  }, []);

  const { data, isLoading, isError } = useQuery<NWPModel[]>({
    queryKey: ["nwp-models"],
    queryFn: getNWPModels,
    staleTime: 30 * 60 * 1000,
  });


  const QuickLinks = [
    
    { href: "/forecasts/risk-table-short", label: "Short-Range Risk Table" },
    { href: "/forecasts/discussion-short", label: "Short-Range Discussion" },
    { href: "/forecasts/risk-table-medium", label: "Medium-Range Risk Table" },
    { href: "/forecasts/discussion-medium", label: "Medium-Range Discussion" },
    { href: "/guidance", label: "Guidance" },
    { href: "/nwp-models", label: "NWP Models" },
    { href: "/forecasts/archive", label: "Forecast Archive" },
  ];
  return (
    <div className="mx-auto px-4 max-w-7xl">


      {/* ✅ RESPONSIVE GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">

        {/* SIDEBAR */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-20">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                {QuickLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className="py-1 px-3 rounded hover:bg-orange-50 hover:text-orange-600 cursor-pointer">
                      {link.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

    <div className="lg:col-span-9 w-full flex flex-col">
      <header ref={headerRef} className="mb-4 md:mb-4">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-10">
          Numerical Weather Prediction (NWP) Models
        </h2>
      </header>



      <p className="text-lg text-gray-600 mb-12 max-w-3xl">
        Operational and research numerical models currently supporting forecasting services.
      </p>

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-10 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Failed to load model list
          </h3>
          <p className="text-red-700/90">
            Please try again later or contact support if the issue persists.
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ModelSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Data */}
      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            No NWP models available yet
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            The list of supported models is being prepared. Check back soon.
          </p>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}