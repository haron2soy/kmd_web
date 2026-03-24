import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import MapView from "@/features/nwp/components/MapView";
import LayerControl from "../components/LayerControl";
import DateTimeControl from "../components/DateTimeControl";
import { getNWPModels, type NWPModel } from "../api";

// -------------------------------
// Extend API type safely
// -------------------------------
type NWPModelExtended = NWPModel & {
  variables?: string[];
};

// -------------------------------
// Per-model state
// -------------------------------
type ModelState = {
  variable: string;
  datetime: string;
};

// -------------------------------
// Page
// -------------------------------
export default function WrfViewer() {
  const {
    data: models,
    isLoading,
    isError,
  } = useQuery<NWPModelExtended[]>({
    queryKey: ["nwp-models"],
    queryFn: getNWPModels,
    staleTime: 30 * 60 * 1000,
  });

  // State per model
  const [modelStates, setModelStates] = useState<
    Record<string, ModelState>
  >({});

  // -------------------------------
  // Initialize state
  // -------------------------------
  useEffect(() => {
      if (!models) return;

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const currentHour = `${yyyy}-${mm}-${dd}_${hh}:00:00`;

      const initialState: Record<string, ModelState> = {};

      models.forEach((model) => {
        initialState[String(model.id)] = {
          variable: model.variables?.[0] ?? "PRECIP",
          datetime: currentHour, // ✅ set to current hour
        };
      });

      setModelStates(initialState);
    }, [models]);

  // -------------------------------
  // Update helpers
  // -------------------------------
  const updateVariable = (modelId: string, variable: string) => {
    setModelStates((prev) => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        variable,
      },
    }));
  };

  const updateDatetime = (modelId: string, datetime: string) => {
    setModelStates((prev) => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        datetime,
      },
    }));
  };

  // -------------------------------
  // UI states
  // -------------------------------
  if (isLoading) return <p className="p-6">Loading models...</p>;

  if (isError || !models?.length)
    return <p className="p-6 text-red-600">Failed to load models</p>;

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className="p-6 grid gap-6 lg:grid-cols-2">
      {models
        .filter((m) => m.status === "live")
        .map((model) => {
          const modelId = String(model.id);
          const state = modelStates[modelId];

          if (!state) return null;

          return (
            <div
              key={modelId}
              className="bg-white border rounded-lg shadow-sm flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-800">
                  {model.name}
                </h2>
              </div>

              {/* Controls */}
              <div className="p-4 flex flex-col gap-4">
                <LayerControl
                  variable={state.variable}
                  setVariable={(v: string) =>
                    updateVariable(modelId, v)
                  }
                />

                <DateTimeControl
                  datetime={state.datetime}
                  setDatetime={(dt: string) =>
                    updateDatetime(modelId, dt)
                  }
                />
              </div>

              {/* Map */}
              <div className="p-4">
                <MapView
                  variable={state.variable}
                  datetime={state.datetime}
                  endpoint={model.apiEndpoint}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}