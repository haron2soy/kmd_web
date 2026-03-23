//nwp/components/WrfMap.tsx
import { useEffect, useRef, useState } from "react";
import maplibregl, { Map, ImageSource } from "maplibre-gl";
import type {LngLatBoundsLike} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Variable = "PRECIP" | "T2"| "WIND";

export default function WrfMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const [hour, setHour] = useState("2026-02-11_13:00:00");
  const [variable, setVariable] = useState<Variable>("PRECIP");
  const [opacity, setOpacity] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_bounds, setBounds] = useState<LngLatBoundsLike | null>(null);

  const previousUrlRef = useRef<string | null>(null);

  // Initialize MapLibre map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: { version: 8, sources: {}, layers: [] },
      center: [37.5, 0],
      zoom: 5,
      interactive: true,
      attributionControl: false,
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  // Fetch and render backend PNG
  useEffect(() => {
    if (!mapRef.current) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/nwp-models/field?datetime=${hour}&variable=${variable}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        // Revoke previous blob
        if (previousUrlRef.current) URL.revokeObjectURL(previousUrlRef.current);
        previousUrlRef.current = url;

        // Get bounds from header
        const boundsHeader = res.headers.get("X-Domain-Bounds");
        if (!boundsHeader) throw new Error("Missing X-Domain-Bounds header");

        const parsedBounds: [[number, number],[number, number],[number, number],[number, number]] =
          JSON.parse(boundsHeader);

        // Compute SW/NE for LngLatBoundsLike
        const lats = parsedBounds.map(([_, lat]) => lat);
        const lngs = parsedBounds.map(([lng, _]) => lng);
        const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
        const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];

        setBounds([sw, ne] as LngLatBoundsLike);

        const map = mapRef.current!;
        if (!map.getSource("wrf")) {
          map.addSource("wrf", { type: "image", url, coordinates: parsedBounds });
          map.addLayer({
            id: "wrf-layer",
            type: "raster",
            source: "wrf",
            paint: { "raster-opacity": opacity },
          });
        } else {
          const source = map.getSource("wrf") as ImageSource;
          source.updateImage({ url, coordinates: parsedBounds });
        }

        map.fitBounds([sw, ne], { padding: 20 });
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [hour, variable, opacity]);

  // Dynamically update opacity
  useEffect(() => {
    const map = mapRef.current;
    if (map?.getLayer("wrf-layer")) {
      map.setPaintProperty("wrf-layer", "raster-opacity", opacity);
    }
  }, [opacity]);

  return (
    <div className="flex flex-col h-screen">
      {/* Controls */}
      <div className="bg-white p-4 flex flex-wrap items-center gap-4 shadow-md">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Date/Time:</label>
          <input
            type="text"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="border px-2 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Variable:</label>
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value as Variable)}
            className="border px-2 py-1 text-sm"
          >
            <option value="PRECIP">Precipitation</option>
            <option value="T2">Temperature</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Opacity:</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
          />
          <span className="text-sm text-gray-600">{Math.round(opacity * 100)}%</span>
        </div>

        {loading && <span className="text-blue-600 text-sm">Loading...</span>}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>

      {/* Map */}
      <div ref={mapContainer} className="flex-1 w-full" />
    </div>
  );
}
