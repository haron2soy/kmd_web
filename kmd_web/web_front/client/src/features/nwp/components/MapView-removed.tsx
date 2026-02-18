import DeckGL from "@deck.gl/react";
import { BitmapLayer } from "@deck.gl/layers";
import { useEffect, useState } from "react";
import Map from "react-map-gl/maplibre";

type Props = {
  variable: string;
  timeIndex: number;
};

export default function MapView({ variable }: Props) {
  const [image, setImage] = useState<ImageBitmap | null>(null);
  const [bounds, setBounds] =
    useState<[number, number, number, number] | null>(null);

  useEffect(() => {
    const datetime = "2026-02-11_13:00:00";

    fetch(`/api/wrf/field?datetime=${datetime}&variable=${variable}`)
      .then(async (res) => {
        const buffer = await res.arrayBuffer();

        const shape = res
          .headers
          .get("X-Shape")!
          .split(",")
          .map(Number); // [ny, nx]

        const data = new Float32Array(buffer);

        const width = shape[1];
        const height = shape[0];

        // Normalize data to 0–255
        const min = Math.min(...data);
        const max = Math.max(...data);

        const imgData = new Uint8ClampedArray(width * height * 4);

        // 🔴 IMPORTANT: flip Y axis (WRF is north→south)
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const src = (height - 1 - y) * width + x;
            const dst = y * width + x;

            const v =
              ((data[src] - min) / (max - min)) * 255;

            imgData[dst * 4 + 0] = v;   // R
            imgData[dst * 4 + 1] = v;   // G
            imgData[dst * 4 + 2] = v;   // B
            imgData[dst * 4 + 3] = 180; // Alpha
          }
        }

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d")!;
        const imageData = new ImageData(imgData, width, height);

        ctx.putImageData(imageData, 0, 0);

        const bitmap = await createImageBitmap(canvas);
        setImage(bitmap);

        // ✅ Exact WRF domain bounds
        setBounds([
          23.31,    // west
          -13.337,  // south
          51.698,   // east
          18.484    // north
        ]);
      });
  }, [variable]);

  const layers =
    image && bounds
      ? [
          new BitmapLayer({
            id: "wrf-grid",
            image,
            bounds,
            opacity: 0.6,
          }),
        ]
      : [];

  return (
    <DeckGL
      initialViewState={{
        longitude: 37,
        latitude: 0,
        zoom: 4,
      }}
      controller={true}
      layers={layers}
    >
      <Map
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      />
    </DeckGL>
  );
}