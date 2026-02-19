import { useState } from "react";
import MapView from "@/features/nwp/components/MapView";
import LayerControl from "../components/LayerControl";
import DateTimeControl from "../components/DateTimeControl";
import { Navbar } from "@/shared/components/layout/Navbar"; // 👈 import your navbar

export default function WrfViewer() {
  const [variable, setVariable] = useState("T2");
  const [datetime, setDatetime] = useState(""); // <-- new state
  
  return (
    <div className="h-screen flex flex-col">

      {/* ✅ Navbar at the very top */}
      <Navbar />

      {/* ✅ Main content below navbar */}
      <div className="flex flex-1">

        {/* Side Panel */}
        <div className="w-64 bg-white shadow-md p-4 flex flex-col gap-4 z-10">
          <h2 className="text-lg font-semibold text-gray-700">
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
        </div>

        {/* Map Area */}
        <div className="flex-1 relative p-4">
          <MapView
            variable={variable}
            datetime={datetime}
            
          />
        </div>

      </div>
    </div>
  );
}
