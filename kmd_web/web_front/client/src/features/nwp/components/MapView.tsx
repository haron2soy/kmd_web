import DeckGL from "@deck.gl/react";
import { BitmapLayer, PathLayer } from "@deck.gl/layers";
import { useEffect, useState } from "react";
import Map from "react-map-gl/maplibre";

type Props = {
  variable: string;
  timeIndex?: number;
};

export default function WrfFieldOverlay({ variable }: Props) {
  const [image, setImage] = useState<ImageBitmap | null>(null);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getColorAndAlpha = (
    norm: number,
    value: number,
    isTemperature: boolean
  ): [number, number, number, number] => {
    let r = 0, g = 0, b = 0, a = 0;

    if (isTemperature) {
      // ─────────────────────────────────────
      // Improved diverging temperature scale
      // blue → cyan → white → yellow → red
      // centered at thermal comfort (~24°C)
      // ─────────────────────────────────────

      // Stronger perceptual shaping
      const t = Math.pow(norm, 0.9);

      if (t < 0.5) {
        // Cold → neutral (blue → white)
        const u = t / 0.5;

        r = Math.round(30 + 225 * u);     // deep blue → white
        g = Math.round(60 + 195 * u);
        b = Math.round(255 - 40 * u);
      } else {
        // Neutral → hot (white → red)
        const u = (t - 0.5) / 0.5;

        r = 255;
        g = Math.round(255 - 200 * u);    // white → yellow → red
        b = Math.round(215 - 215 * u);    // fade blue fast
      }

      // Slight boost around human-relevant temps
      const comfortBoost = Math.exp(-Math.pow((norm - 0.55) * 5, 2)); 
      a = Math.round(200 + 40 * comfortBoost);

      if (!Number.isFinite(value)) a = 0;
    } else {
      // Keep your precipitation ramp (unchanged but slightly smoother)
      const t = Math.pow(norm, 0.5);

      if (t < 0.1) {
        r = 120 + Math.round(100 * (t / 0.1));
        g = 210 + Math.round(45 * (t / 0.1));
        b = 250 - Math.round(30 * (t / 0.1));
      } else if (t < 0.3) {
        const u = (t - 0.1) / 0.2;
        r = 220 + Math.round(35 * u);
        g = 255;
        b = 220 - Math.round(160 * u);
      } else if (t < 0.6) {
        const u = (t - 0.3) / 0.3;
        r = 255;
        g = 255 - Math.round(175 * u);
        b = 60 - Math.round(45 * u);
      } else {
        const u = (t - 0.6) / 0.4;
        r = 255;
        g = 80 - Math.round(70 * u);
        b = 15 - Math.round(10 * u);
      }

      a = Math.round(70 + 185 * Math.pow(norm, 0.4));
      a = Math.min(255, Math.max(0, a));
    }

    return [r, g, b, a];
  };


  useEffect(() => {
    const datetime = "2026-02-11_13:00:00";

    setImage(null);
    setError(null);

    fetch(`/api/wrf/field?datetime=${datetime}&variable=${variable}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const shapeHeader = res.headers.get("X-Shape");
        if (!shapeHeader) throw new Error("Missing X-Shape header");

        const [height, width] = shapeHeader.split(",").map(Number);
        if (!Number.isFinite(height) || !Number.isFinite(width)) {
          throw new Error("Invalid shape");
        }

        const buffer = await res.arrayBuffer();
        const data = new Float32Array(buffer);

        if (data.length !== width * height) {
          throw new Error("Data length mismatch");
        }

        let min = Infinity;
        let max = -Infinity;
        for (const v of data) {
          if (!Number.isNaN(v) && v !== 0) {
            min = Math.min(min, v);
            max = Math.max(max, v);
          }
        }

        const range = max - min;
        const hasRange = range > 1e-6 && Number.isFinite(range);

        const imgData = new Uint8ClampedArray(width * height * 4);

        const isTemperature = ["T2", "T", "temperature", "t2m"].some((v) =>
          variable.toLowerCase().includes(v)
        );

        // Flip Y-axis (WRF row 0 = south)
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const srcIdx = (height - 1 - y) * width + x;
            const dstIdx = y * width + x;

            const value = data[srcIdx];

            let norm = 0;
            if (hasRange) {
              norm = (value - min) / range;
              norm = Math.max(0, Math.min(1, norm));
            }

            if (isTemperature) {
              // Region-specific fixed range (Nairobi / East Africa Feb-like climatology)
              const tempMin = 12;
              const tempMax = 34;
              norm = (value - tempMin) / (tempMax - tempMin);
              norm = Math.max(0, Math.min(1, norm));
            }

            const [r, g, b, a] = getColorAndAlpha(norm, value, isTemperature);

            const o = dstIdx * 4;
            imgData[o + 0] = r;
            imgData[o + 1] = g;
            imgData[o + 2] = b;
            imgData[o + 3] = a;
          }
        }

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("No 2D context");

        ctx.putImageData(new ImageData(imgData, width, height), 0, 0);
        const bitmap = await createImageBitmap(canvas);

        setImage(bitmap);
        setBounds([23.31, -13.337, 51.698, 18.484]);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load WRF field");
      });
  }, [variable]);

  const domainPath = bounds
    ? [[
        [bounds[0], bounds[1]],
        [bounds[2], bounds[1]],
        [bounds[2], bounds[3]],
        [bounds[0], bounds[3]],
        [bounds[0], bounds[1]],
      ]]
    : [];

  const layers =
    image && bounds
      ? [
          new BitmapLayer({
            id: `wrf-${variable}`,
            image,
            bounds,
            opacity: 0.92, // slightly lower to blend nicely with basemap
          }),

          new PathLayer({
            id: "wrf-domain-outline",
            data: domainPath,
            getPath: (d) => d,
            getColor: [50, 50, 50, 140],
            getWidth: 2,
            widthUnits: "pixels",
            parameters: { depthTest: false },
          }),
        ]
      : [];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <DeckGL
        initialViewState={{
          longitude: 37.5,
          latitude: 2.5,
          zoom: 4.2,
        }}
        controller
        layers={layers}
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>

      {error && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            background: "rgba(220, 60, 60, 0.92)",
            color: "white",
            padding: "0.9rem 1.4rem",
            borderRadius: 6,
            zIndex: 10,
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      {!image && !error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.05)",
            color: "#555",
            fontSize: "1.2rem",
            zIndex: 5,
          }}
        >
          Loading {variable.toUpperCase()}…
        </div>
      )}
    </div>
  );
}