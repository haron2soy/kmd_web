// src/features/forecasts/components/FilePreviewModal.tsx

import { useState, useEffect } from "react";
import Draggable from "react-draggable";
import { ResizableBox, type ResizeCallbackData } from "react-resizable";

import "react-resizable/css/styles.css";
import type {Dispatch, SetStateAction} from "react";
interface FileItem {
  name: string;
  url: string;
  type: "image" | "document";
}

interface FilePreviewModalProps {
  previewFileIndex: number | null;
  setPreviewFileIndex: Dispatch<SetStateAction<number | null>>;
  files: FileItem[];
}

export default function FilePreviewModal({
  previewFileIndex,
  setPreviewFileIndex,
  files,
}: FilePreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [width, setWidth] = useState(860);
  const [height, setHeight] = useState(680);

  useEffect(() => {
    setWidth(860);
    setHeight(680);
    setIsFullscreen(false);
  }, [previewFileIndex]);

  if (previewFileIndex === null) return null;

  const file = files[previewFileIndex];
  const isPdf = file.name.toLowerCase().endsWith(".pdf");
  const isImage = file.type === "image";

  const handleClose = () => setPreviewFileIndex(null);
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const goPrev = () =>
    setPreviewFileIndex((prev) =>
      prev === null ? null : (prev - 1 + files.length) % files.length
    );

  const goNext = () =>
    setPreviewFileIndex((prev) =>
      prev === null ? null : (prev + 1) % files.length
    );

  const content = (
    <div
      className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden ${
        isFullscreen ? "h-screen w-screen rounded-none" : "h-full"
      }`}
    >
      {/* Header */}
      <div
        className={`bg-gray-100 px-4 py-3 flex items-center justify-between border-b ${
          !isFullscreen ? "cursor-move select-none" : ""
        }`}
      >
        <div className="font-medium truncate max-w-[70%] text-gray-800">
          {file.name}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-200 transition"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? "↙" : "↗"}
          </button>

          <button
            onClick={handleClose}
            className="p-1.5 text-gray-600 hover:text-red-600 rounded hover:bg-gray-200 transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 bg-gray-900 relative overflow-hidden">
        {isPdf ? (
          <iframe
            src={file.url}
            className="absolute inset-0 w-full h-full border-0"
            title={file.name}
          />
        ) : isImage ? (
          <img
            src={file.url}
            alt={file.name}
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
              file.url
            )}`}
            className="absolute inset-0 w-full h-full border-0"
            title={file.name}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t bg-gray-50 flex justify-center">
        <a
          href={file.url}
          download
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          Download
        </a>
      </div>

      {/* Navigation */}
      {files.length > 1 && !isFullscreen && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/65 hover:bg-black/85 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-md z-20 transition"
          >
            ◀
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/65 hover:bg-black/85 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-md z-20 transition"
          >
            ▶
          </button>
        </>
      )}
    </div>
  );

  if (!isFullscreen) {
    const maxWidth = typeof window !== "undefined" ? window.innerWidth * 0.96 : 1200;
    const maxHeight = typeof window !== "undefined" ? window.innerHeight * 0.96 : 900;

    return (
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 flex items-center justify-center p-5 z-[1000]"
      >
        <Draggable handle=".cursor-move" bounds="parent">
          <div onClick={(e) => e.stopPropagation()}>
            <ResizableBox
              width={width}
              height={height}
              minConstraints={[480, 360]}
              maxConstraints={[maxWidth, maxHeight]}
              resizeHandles={["se", "sw", "ne", "nw"]}
              onResize={(_e: React.SyntheticEvent, data: ResizeCallbackData) => {
                setWidth(data.size.width);
                setHeight(data.size.height);
              }}
            >
              {content}
            </ResizableBox>
          </div>
        </Draggable>
      </div>
    );
  }

  return <div className="fixed inset-0 bg-black z-[1000]">{content}</div>;
}