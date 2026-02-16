// MapView.tsx - Updated with base map
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "@deck.gl/layers";
import type { MapViewState, ViewStateChangeParameters } from "@deck.gl/core";
import { useMemo, useState, useEffect } from "react";
import Map from "react-map-gl/maplibre"; // Using MapLibre for base map

type MapViewProps = {
  variable: string;
  timeIndex: number;
  opacity?: number;
  showBaseMap?: boolean;
};

export default function MapView({ 
  variable, 
  timeIndex, 
  opacity = 0.7,
  showBaseMap = true 
}: MapViewProps) {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 37.0, // Center on Kenya
    latitude: 0.0,
    zoom: 5,
    pitch: 0,
    bearing: 0
  });

  // Fetch metadata when variable changes
  useEffect(() => {
    fetch(`/api/nwp-models/metadata/?file=wrfout_d01_2026-02-11_13:00:00`)
      .then(res => res.json())
      .then(data => {
        console.log("WRF Metadata:", data);
        // Could auto-zoom to domain bounds here
      })
      .catch(err => console.error("Failed to fetch metadata:", err));
  }, []);

  const layers = useMemo(() => {
    if (!variable) return [];

    return [
      new TileLayer({
        id: "wrf-tile-layer",
        data: `http://localhost:8000/api/nwp-models/wrf/${variable}/{z}/{x}/{y}.png?time_index=${timeIndex}&file=wrfout_d01_2026-02-11_13:00:00&opacity=${opacity}`,
        
        minZoom: 0,
        maxZoom: 12,
        tileSize: 256,
        
        // Add opacity control
        opacity: opacity,
        
        // Rendering options
        renderSubLayers: (props: any) => {
          const { 
            bbox: { west, south, east, north },
            data,
            opacity 
          } = props.tile;

          return new BitmapLayer(props, {
            image: data,
            bounds: [west, south, east, north],
            opacity: opacity,
            desaturate: 0.2, // Slightly desaturate to see base map
          });
        },
        
        // Update when these change
        updateTriggers: {
          data: [variable, timeIndex, opacity],
        },
      }),
    ];
  }, [variable, timeIndex, opacity]);

  return (
    <DeckGL
    viewState={viewState}
    onViewStateChange={(params: ViewStateChangeParameters) => {
      setViewState(params.viewState as MapViewState);
    }}
    controller={true}
    layers={layers}
    style={{ position: 'relative', width: '100%', height: '100%' }}
  >
      {/* Base map using MapLibre */}
      {showBaseMap && (
        <Map
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      )}
    </DeckGL>
  );
}