import { useState, useEffect, useMemo } from "react";

type MapViewProps = {
  variable: string;
  /** 
   * ISO-like datetime string: "2025-02-25_06:00:00"  
   * If falsy (undefined, "", null), uses current UTC hour automatically 
   */
  datetime?: string;
  opacity?: number;
  width?: number | string;
  className?: string;
};

/**
 * Returns current UTC time, floored to the start of the hour
 * Format: "YYYY-MM-DD_HH:00:00"
 */
function getCurrentUTCHour(): string {
  const now = new Date();

  // Floor to start of current UTC hour
  now.setUTCMinutes(0, 0, 0);

  // Add 3 hours
  now.setUTCHours(now.getUTCHours() + 3);

  return now.toISOString().slice(0, 19).replace("T", "_");
}

export default function MapView({
  variable,
  datetime,
  opacity = 0.85,
  width = "90%",
  className = "",
}: MapViewProps) {
  // Only compute once on mount
  const autoDatetime = useMemo(() => getCurrentUTCHour(), []);

  // Treat empty string / falsy values as "use automatic"
  const effectiveDatetime = datetime?.trim() 
    ? datetime.trim()
    : autoDatetime;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);     // start as true for initial load
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    setLoading(true);
    setError(null);
    setImageUrl(null);
    setImageAspect(null);

    const url = `/api/nwp_models/field/?datetime=${effectiveDatetime}&variable=${encodeURIComponent(variable)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            res.status === 400
              ? `No data available for ${effectiveDatetime}`
              : `Server error ${res.status} for ${effectiveDatetime}`
          );
        }
        return res.blob();
      })
      .then((blob) => {
        if (blob.size === 0) {
          throw new Error("Received empty image");
        }
        objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => {
          setImageAspect(img.naturalWidth / img.naturalHeight);
        };
        img.onerror = () => {
          setError("Failed to load image dimensions");
        };
        img.src = objectUrl;

        setImageUrl(objectUrl);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Map image fetch failed:", err);
        setError(err.message || "Failed to load map image");
        setLoading(false);
      });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [effectiveDatetime, variable]);

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
      <div
        style={{
          width: "100%",
          aspectRatio: imageAspect ? `${imageAspect}` : "4 / 5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: loading ? "#f1f5f9" : undefined,
        }}
      >
        {loading && (
          <div className="text-gray-600 font-medium flex items-center gap-2">
            <span className="animate-pulse">Loading map...</span>
          </div>
        )}

        {error && (
          <div className="text-red-600 font-medium px-4 text-center">
            {error}
            <br />
            <small className="text-gray-500 mt-1 block">
              {effectiveDatetime}
            </small>
          </div>
        )}

        {!loading && !error && imageUrl && (
          <img
            src={imageUrl}
            alt={`${variable} — ${effectiveDatetime}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity,
              imageRendering: "crisp-edges", // optional – helps with map sharpness
            }}
            decoding="async"
          />
        )}
      </div>
    </div>
  );
}