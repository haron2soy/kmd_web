// hooks/useWrfImage.ts
import { useEffect, useState } from "react";

export function useWrfImage({
  variable,
  datetime,
  endpoint,
}: {
  variable: string;
  datetime: string;
  endpoint: string; // e.g., "/api/nwp/wrf/field/"
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspect, setAspect] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    setLoading(true);
    setError(null);

    if (!endpoint) {
      setError("No endpoint specified");
      setLoading(false);
      return;
    }

    // Construct full URL with query params
    const url = `${endpoint}?datetime=${encodeURIComponent(datetime)}&variable=${encodeURIComponent(variable)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Image not yet generated (status: ${res.status})`);
        return res.blob();
      })
      .then((blob) => {
        if (!blob.size) throw new Error("Received empty image");
        objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => setAspect(img.naturalWidth / img.naturalHeight);
        img.onerror = () => setError("Failed to load image");
        img.src = objectUrl;

        setImageUrl(objectUrl);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch image");
        setLoading(false);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [variable, datetime, endpoint]);

  return { imageUrl, aspect, loading, error };
}