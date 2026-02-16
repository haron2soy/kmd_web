// MAIN DASHBOARD

import { useState } from "react";
import MapView from "../features/nwp/components/MapView";
import TimeSlider from "../features/nwp/components/TimeSlider";
import LayerControl from "../features/nwp/components/LayerControl";
import Legend from "../features/nwp/components/Legend";
import { useGeoData } from "../features/nwp/hooks/useGeoData";

export default function Dashboard() {
  const [timeIndex, setTimeIndex] = useState(0);
  const [variable, setVariable] = useState("T2");

  const data = useGeoData(variable, timeIndex);

  return (
    <div style={{ height: "100vh" }}>
      <LayerControl variable={variable} setVariable={setVariable} />
      <TimeSlider value={timeIndex} onChange={setTimeIndex} />
      <Legend />
      <MapView data={data} />
    </div>
  );
}
