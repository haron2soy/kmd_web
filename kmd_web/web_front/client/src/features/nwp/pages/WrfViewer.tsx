import { useState } from "react";
import MapView from "@/features/nwp/components/MapView";
import LayerControl from "../components/LayerControl";
import DateTimeControl from "../components/DateTimeControl";
//import { ScrolltoHeader } from "@/features/user_authentication/ScrolltoHeader";
import {useScrollToHeader} from "@/shared/components/ScrollToHeader/useScrollToHeader";


  
  //<header ref={headerRef} className="mb-4 md:mb-4"></header>
export default function WrfViewer() {
  const { headerRef } = useScrollToHeader<HTMLHeadingElement>(80);
  const [variable, setVariable] = useState("T2");
  const [datetime, setDatetime] = useState("");

  return (
    <div  className="min-h-screen flex">

      {/* Side Panel */}
      {/*<aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shadow-sm">*/}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col justify-center items-start gap-6 shadow-sm">
        <h2 ref={headerRef} className="text-lg font-semibold text-slate-700">
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