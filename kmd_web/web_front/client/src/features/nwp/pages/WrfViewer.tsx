// pages/WrfViewer.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import MapView from "@/features/nwp/components/MapView";
import LayerControl from "../components/LayerControl";
import DateTimeControl from "../components/DateTimeControl";
import ModelControl from "../components/ModelControl";
import { useScrollToHeader } from "@/shared/components/ScrollToHeader/useScrollToHeader";
import { getNWPModels, type NWPModel } from "../api";

export default function WrfViewer() {
  const { headerRef } = useScrollToHeader<HTMLHeadingElement>(80);

  // -------------------------------
  // State
  // -------------------------------
  const [selectedModel, setSelectedModel] = useState<NWPModel | null>(null);
  const [variable, setVariable] = useState<string>("T2");
  const [datetime, setDatetime] = useState<string>("");

  // -------------------------------
  // Fetch models via React Query
  // -------------------------------
  const { data: models, isLoading, isError } = useQuery<NWPModel[], Error>({
    queryKey: ["nwp-models"],
    queryFn: getNWPModels,
    staleTime: 30 * 60 * 1000,
  });

  // -------------------------------
  // Initialize selected model
  // -------------------------------
  useEffect(() => {
    if (!selectedModel && models && models.length > 0) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);

  // -------------------------------
  // Initialize datetime to current hour
  // -------------------------------
  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");

    const currentDatetime = `${yyyy}-${mm}-${dd}_${hh}:00:00`;
    setDatetime(currentDatetime);
  }, []);

  // -------------------------------
  // Update page title dynamically
  // -------------------------------
  useEffect(() => {
    document.title = selectedModel
      ? `${selectedModel.name} | NWP Viewer`
      : "NWP Viewer";
  }, [selectedModel]);

  // -------------------------------
  // Loading/Error UI
  // -------------------------------
  if (isLoading) return <p className="p-6 text-gray-600">Loading models...</p>;
  if (isError || !models || models.length === 0)
    return <p className="p-6 text-red-600">Failed to load NWP models.</p>;
  if (!selectedModel)
    return <p className="p-6 text-gray-600">Select a model to continue.</p>;

  // -------------------------------
  // Render
  // -------------------------------
  return (
  <div className="min-h-screen flex bg-gray-50">
    {/* Sidebar (ONLY model selector) */}
    <aside className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 shadow-sm">
      <h2
        ref={headerRef}
        className="text-lg font-semibold text-gray-800"
      >
        NWP Controls
      </h2>

      <ModelControl
        models={models}
        selectedModel={selectedModel}
        setModel={setSelectedModel}
      />
    </aside>

    {/* Main content */}
    <div className="flex-1 p-4 flex flex-col gap-4">
      
      {/* ✅ MAP ON TOP */}
      <MapView
        variable={variable}
        datetime={datetime}
        endpoint={selectedModel.apiEndpoint}
      />

      {/* ✅ CONTROLS BELOW MAP */}
      <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-col gap-4">
        <LayerControl
          variable={variable}
          setVariable={setVariable}
        />

        <DateTimeControl
          datetime={datetime}
          setDatetime={setDatetime}
        />
      </div>

    </div>
  </div>
);
}