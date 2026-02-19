import { useState, useEffect, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { BitmapLayer } from "@deck.gl/layers";
import type { ViewStateChangeParameters, MapViewState } from "@deck.gl/core";

type MapViewProps = {
  variable: string;
  datetime: string;
  opacity?: number;
  width?: number | string;
  height?: number | string;
  className?: string;
};

const IMAGE_BOUNDS: [number, number, number, number] = [22, -15, 52, 20];

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 37.8,
  latitude: 1.0,
  zoom: 3.5,
  pitch: 0,
  bearing: 0,
  minZoom: 3.5,
};

export default function MapView({
  variable,
  datetime,
  opacity = 0.85,
  width = "90%",
  className = "",
}: MapViewProps) {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clamp map movements
  const onViewStateChange = useCallback(
    (params: ViewStateChangeParameters) => {
      if ("longitude" in params.viewState) {
        const next = clampViewState(params.viewState as MapViewState, IMAGE_BOUNDS);
        setViewState(next);
      }
    },
    []
  );

  // Pre-fetch image and handle missing data
  useEffect(() => {
    setLoading(true);
    setError(null);
    setImageUrl(null);

    const url = `/api/nwp_models/field/?datetime=${datetime}&variable=${variable}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("No image available for this datetime");
        }
        return res.blob();
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [datetime, variable]);

  // Only create BitmapLayer when image is loaded
  const layers = imageUrl
    ? [
        new BitmapLayer({
          id: "wrf-field-layer",
          image: imageUrl,
          bounds: IMAGE_BOUNDS,
          opacity,
          pickable: true,
        }),
      ]
    : [];

  return (
    <div
      className={`relative ${className}`}
      style={{
        width,
        maxWidth: "1200px",
        aspectRatio: "16 / 9",
        margin: "0px auto",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#f8fafc",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        touchAction: "none",
      }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-700 font-semibold">
          Loading...
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-600 font-semibold">
          {error}
        </div>
      )}

      {!loading && !error && imageUrl && (
        <DeckGL
          viewState={viewState}
          onViewStateChange={onViewStateChange}
          controller={true}
          layers={layers}
          getCursor={({ isDragging }) => (isDragging ? "grabbing" : "grab")}
          style={{ width: "100%", height: "100%" }}
        />
      )}

      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          background: "rgba(0,0,0,0.55)",
          color: "white",
          padding: "4px 8px",
          borderRadius: 4,
          fontSize: 12,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        zoom: {viewState.zoom.toFixed(1)}
      </div>
    </div>
  );
}

function clampViewState(viewState: MapViewState, bounds: [number, number, number, number]): MapViewState {
  const [west, south, east, north] = bounds;
  const lonSpan = 360 / Math.pow(2, viewState.zoom);
  const latSpan = 170 / Math.pow(2, viewState.zoom);

  const minLon = west + lonSpan / 2;
  const maxLon = east - lonSpan / 2;
  const minLat = south + latSpan / 2;
  const maxLat = north - latSpan / 2;

  return {
    ...viewState,
    longitude: Math.min(maxLon, Math.max(minLon, viewState.longitude)),
    latitude: Math.min(maxLat, Math.max(minLat, viewState.latitude)),
  };
}
