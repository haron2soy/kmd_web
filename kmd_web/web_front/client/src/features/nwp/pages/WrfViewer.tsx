// WrfViewer.tsx
// Main integration point for WRF visualization using deck.gl TileLayer (server tiles)

import { useState, useEffect } from "react";
import MapView from "@/features/nwp/components/MapView";
import TimeSlider from "../components/TimeSlider";
import LayerControl from "../components/LayerControl";
import Legend from "../components/Legend";

export default function WrfViewer() {
  const [timeIndex, setTimeIndex] = useState(0);
  const [variable, setVariable] = useState("T2");

  // Optional: auto-play animation (can disable if not needed)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeIndex((t) => 1); //(t + 1) % 24); // adjust to your timestep count
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex flex-col">

      {/* Controls Panel */}
      <div className="p-3 bg-white shadow flex gap-4 items-center z-10">
        <LayerControl variable={variable} setVariable={setVariable} />
        <TimeSlider value={timeIndex} onChange={setTimeIndex} />
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        
        {/* 🚨 KEY CHANGE: pass variable + timeIndex */}
        <MapView variable={variable} timeIndex={timeIndex} />

        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4">
          <Legend variable={variable} />
        </div>
      </div>
    </div>
  );
}
