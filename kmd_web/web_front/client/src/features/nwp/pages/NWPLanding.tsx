// src/features/nwp/pages/NWPLanding.tsx
import { useQuery } from "@tanstack/react-query";
import { getNWPModels } from "../api";
import { PageLayout } from "@/shared/components/layout/PageLayout";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Clock, AlertCircle } from "lucide-react";

interface NWPModel {
  id: string | number;
  name: string;
  description: string;
  // future optional fields
  status?: "pending" | "live" | "deprecated";
  resolution?: string;
  updateFrequency?: string;
}

const ModelCard = ({ model }: { model: NWPModel }) => (
  <div className="group relative p-6 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary/40 transition-all duration-200 bg-white">
    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    
    <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors mb-3">
      {model.name}
    </h3>
    
    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
      {model.description || "No description available."}
    </p>

    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
      <Clock className="h-3.5 w-3.5" />
      <span>Data integration pending</span>
    </div>
  </div>
);

const ModelSkeleton = () => (
  <div className="p-6 border border-gray-200 rounded-lg bg-white">
    <Skeleton className="h-6 w-3/4 mb-3" />
    <Skeleton className="h-16 w-full mb-4" />
    <Skeleton className="h-5 w-32" />
  </div>
);

export default function NWPLanding() {
  const { data, isLoading, isError } = useQuery<NWPModel[]>({
    queryKey: ["nwp-models"],
    queryFn: getNWPModels,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-10">
          Numerical Weather Prediction (NWP) Models
        </h1>

        <p className="text-lg text-gray-600 mb-12 max-w-3xl">
          Operational and research numerical models currently supporting forecasting services.
        </p>

        {isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-10 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Failed to load model list
            </h3>
            <p className="text-red-700/90">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ModelSkeleton key={i} />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              No NWP models available yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              The list of supported models is being prepared. Check back soon or explore other forecasting products.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}