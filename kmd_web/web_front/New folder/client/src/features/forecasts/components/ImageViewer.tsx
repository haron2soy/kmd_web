import React from "react";

interface ImageViewerProps {
  src: string;
  alt?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt }) => {
  return (
    <div className="flex justify-center">
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto"
      />
    </div>
  );
};
