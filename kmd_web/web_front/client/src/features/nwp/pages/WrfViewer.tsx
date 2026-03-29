// src/features/nwp/pages/WrfViewer.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";

import MapView from "@/features/nwp/components/MapView";
import LayerControl from "../components/LayerControl";
import DateTimeControl from "../components/DateTimeControl";
import { useScrollToHeader } from "@/shared/components/ScrollToHeader/useScrollToHeader";
import { getNWPModels, type NWPModel } from "../api";

// -------------------------------
// Extend backend type
// -------------------------------
type NWPModelExtended = NWPModel & {
  variables?: string[];
  days?: { id: string; label: string; prefix: string }[];
};

export default function WrfViewer() {
  // -------------------------------
  // Route param
  // -------------------------------
  const [, params] = useRoute("/nwp-models/:modelId");
  const modelId = params?.modelId;

  // -------------------------------
  // Fetch models
  // -------------------------------
  const { data: models, isLoading, isError } = useQuery<
    NWPModelExtended[],
    Error
  >({
    queryKey: ["nwp-models"],
    queryFn: getNWPModels,
    staleTime: 30 * 60 * 1000,
  });

  // -------------------------------
  // Resolve selected model
  // -------------------------------
  const model = models?.find(
    (m) => String(m.id) === String(modelId)
  );

  // -------------------------------
  // State
  // -------------------------------
  const [variable, setVariable] = useState<string>("");
  const [datetime, setDatetime] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const { headerRef } = useScrollToHeader(80);
  // -------------------------------
  // Initialize defaults (ONCE model is ready)
  // -------------------------------
useEffect(() => {
  if (!model) return;

  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);

  const get = (type: string) =>
    parts.find(p => p.type === type)?.value;

  const datetime = `${get("year")}-${get("month")}-${get("day")}_${get("hour")}:00:00`;

  setDatetime(datetime);
}, [model]);

  // -------------------------------
  // Update page title
  // -------------------------------
    useEffect(() => {
      if (model) {
        document.title = `${model.name} | NWP Viewer`;
      }
    }, [model]);

    useEffect(() => {
    if (model?.variables?.length) {
      setVariable(model.variables[0]);
    }
    }, [model]);

    useEffect(() => {
      if (model?.days?.length) {
        setDay(model.days[0].id);
      }
    }, [model]);
  // -------------------------------
  // UI states
  // -------------------------------
  if (isLoading)
    return <p className="p-6 text-gray-600">Loading model...</p>;

  if (isError || !models)
    return <p className="p-6 text-red-600">Failed to load models.</p>;

  if (!model)
    return <p className="p-6 text-gray-600">Model not found.</p>;

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-0 flex flex-col gap-1">
      
      {/* Header */}
      <header ref={headerRef} className="mb-4 md:mb-4">
        <h1 className="text-lg font-semibold text-gray-800 m-0">
          {model.name}
        </h1>
      </header>

      {/* Map */}
      <MapView
        variable={variable}
        datetime={datetime}
        day={day}
        endpoint={model.apiEndpoint}
      />

      {/* Controls */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        
        <div className="flex flex-wrap items-center gap-6">

          {/* Variables */}
          <div className="flex items-center gap-2">
            <span className="text-md text-gray-600">Variable:</span>
            <LayerControl
              variable={variable}
              setVariable={setVariable}
              options={model.variables || []}
            />
          </div>

          {/* Days */}
          <div className="flex items-center gap-2">
            <span className="text-md text-gray-600">Day:</span>
            <div className="flex gap-2">
              {model.days?.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDay(d.id)}
                  className={`px-3 py-1.5 border rounded text-sm transition
                    ${
                      day === d.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white hover:bg-gray-100"
                    }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Datetime */}
          <div className="flex items-center gap-2">
            <DateTimeControl
              datetime={datetime}
              setDatetime={setDatetime}
            />
          </div>

          {/* Scroll button */}
          <div className="ml-auto">
            <button
              onClick={() => {
                headerRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Scroll to Top
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}