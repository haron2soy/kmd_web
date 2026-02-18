import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const EMPTY_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#fdfdfd" },
    },
  ],
};

/* ✅ Replace domain.json with in-code GeoJSON */
const DOMAIN_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [23.31, -13.337],
          [51.698, -13.337],
          [51.698, 18.484],
          [23.31, 18.484],
          [23.31, -13.337],
        ]],
      },
      properties: {},
    },
  ],
};

export default function WrfMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: EMPTY_STYLE,
      center: [37.5, 2.5],
      zoom: 4,
    });

    map.on("load", () => {
      /* ───── DOMAIN SOURCE (INLINE) ───── */
      map.addSource("domain", {
        type: "geojson",
        data: DOMAIN_GEOJSON,
      });

      map.addLayer({
        id: "domain-fill",
        type: "fill",
        source: "domain",
        paint: {
          "fill-color": "#3498db",
          "fill-opacity": 0.25,
        },
      });

      map.addLayer({
        id: "domain-outline",
        type: "line",
        source: "domain",
        paint: {
          "line-color": "#1f4fd8",
          "line-width": 3,
        },
      });

      /* ───── AUTO-FIT (NO FETCH) ───── */
      const coords = (DOMAIN_GEOJSON.features[0].geometry as any).coordinates[0];

      const lons = coords.map((c: number[]) => c[0]);
      const lats = coords.map((c: number[]) => c[1]);

      map.fitBounds(
        [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ],
        { padding: 40 }
      );
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  return <div ref={mapContainer} className="h-screen w-full" />;
}
