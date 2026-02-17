import { useState } from "react";
import MapView from "@/features/nwp/components/MapView";
import LayerControl from "../components/LayerControl";
import Legend from "../components/Legend";

export default function WrfViewer() {
  const [variable, setVariable] = useState("T2");

  return (
    <div className="h-screen flex flex-col">
      {/* Controls */}
      <div className="p-3 bg-white shadow flex gap-4 items-center z-10">
        <LayerControl variable={variable} setVariable={setVariable} />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView variable={variable} timeIndex={0} />

        <div className="absolute bottom-4 left-4">
          <Legend variable={variable} />
        </div>
      </div>
    </div>
  );
}