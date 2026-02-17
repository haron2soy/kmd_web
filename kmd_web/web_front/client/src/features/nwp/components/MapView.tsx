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
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  useEffect(() => {
    const datetime = "2026-02-11_13:00:00";

    fetch(`/api/wrf/field?datetime=${datetime}&variable=${variable}`)
      .then(async (res) => {
        const buffer = await res.arrayBuffer();

        const shape = res.headers.get("X-Shape")!.split(",").map(Number);
        const data = new Float32Array(buffer);

        // 👉 normalize to 0–255 grayscale
        const min = Math.min(...data);
        const max = Math.max(...data);

        const imgData = new Uint8ClampedArray(shape[0] * shape[1] * 4);

        for (let i = 0; i < data.length; i++) {
          const v = ((data[i] - min) / (max - min)) * 255;

          imgData[i * 4 + 0] = v; // R
          imgData[i * 4 + 1] = v; // G
          imgData[i * 4 + 2] = v; // B
          imgData[i * 4 + 3] = 180; // alpha
        }

        const canvas = new OffscreenCanvas(shape[1], shape[0]);
        const ctx = canvas.getContext("2d")!;
        const imageData = new ImageData(imgData, shape[1], shape[0]);

        ctx.putImageData(imageData, 0, 0);

        const bitmap = await createImageBitmap(canvas);

        setImage(bitmap);

        // East Africa bounds (replace with backend later)
        setBounds([23, -13, 52, 19]);
      });
  }, [variable]);

  const layers = image && bounds ? [
    new BitmapLayer({
      id: "wrf-grid",
      image,
      bounds,
      opacity: 0.6,
    })
  ] : [];

  return (
    <DeckGL
      initialViewState={{
        longitude: 37,
        latitude: 0,
        zoom: 5,
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
