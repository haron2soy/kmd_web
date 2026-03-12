import { useState } from "react";
import MapView from "@/features/nwp/components/MapView";
import LayerControl from "../components/LayerControl";
import DateTimeControl from "../components/DateTimeControl";

export default function WrfViewer() {
  const [variable, setVariable] = useState("T2");
  const [datetime, setDatetime] = useState("");

  return (
    <div className="min-h-screen flex">

      {/* Side Panel */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700">
          WRF Controls
        </h2>

        <LayerControl
          variable={variable}
          setVariable={setVariable}
        />

        <DateTimeControl
          datetime={datetime}
          setDatetime={setDatetime}
        />
      </aside>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapView
          variable={variable}
          datetime={datetime}
        />
      </div>

    </div>
  );
}