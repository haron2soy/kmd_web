//components/MapView.tsx
import { useMemo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useWrfImage } from "@/features/nwp/hooks/useWrfImage";

type MapViewProps = {
  variable: string;
  datetime?: string;
  day:string;
  endpoint: string;
  opacity?: number;
  width?: number | string;
  className?: string;
};

/**
 * Returns current UTC time floored to the hour
 * Format: YYYY-MM-DD_HH:00:00
 */
function getCurrentUTCHour(): string {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  return now.toISOString().slice(0, 19).replace("T", "_");
}

export default function MapView({
  variable,
  datetime,
  endpoint,
  day,
  opacity = 0.85,
  width = "90%",
  className = "",
}: MapViewProps) {
  // Fallback to current UTC hour if datetime not provided
  const autoDatetime = useMemo(() => getCurrentUTCHour(), []);
  const effectiveDatetime = datetime?.trim()
    ? datetime.trim()
    : autoDatetime;

  // 🔥 Hook handles all fetching logic
  const { imageUrl, aspect, loading, error } = useWrfImage({
    variable,
    datetime: effectiveDatetime,
    endpoint,
    day,
  });

  return (
    <div
      className={`relative ${className}`}
      style={{
        width,
        maxWidth: "1200px",
        margin: "0 auto",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#f8fafc",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Maintain aspect ratio */}
      <div
        style={{
          width: "100%",
          aspectRatio: aspect ? `${aspect}` : "4 / 5",
        }}
      >
        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-medium">
            <span className="animate-pulse">Loading map...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-600 font-medium px-4 text-center">
            {error}
            <br />
            <small className="text-gray-500 mt-2">
              {effectiveDatetime}
            </small>
          </div>
        )}

        {/* Image */}
        {!loading && !error && imageUrl && (
          <TransformWrapper
                    
            initialScale={1}
            minScale={1}
            maxScale={8}
            limitToBounds={false}
            wheel={{
              step: 0.15,
              activationKeys: ["Control"], 
            }}
            doubleClick={{ step: 1.8 }}
            pinch={{ step: 5 }}
          >
          
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: "100%",
              }}
              contentStyle={{
                width: "100%",
                height: "100%",
              }}
            >
              <img
                src={imageUrl}
                alt={`${variable} — ${effectiveDatetime}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  opacity,
                  imageRendering: "crisp-edges",
                  userSelect: "none",
                  touchAction: "none",
                }}
                decoding="async"
                draggable={false}
              />
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>
    </div>
  );
}