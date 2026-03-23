// src/features/forecasts/components/FilePreviewModal.tsx
import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

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
  if (previewFileIndex === null) return null;
    const sortedFiles = [...files].sort((a, b) => {
      const getDate = (name: string) => {
        const match = name.match(/(\d{1,2})_([A-Za-z]+)_(\d{4})/);
        if (!match) return 0;

        const [, day, month, year] = match;
        return new Date(`${month} ${day}, ${year}`).getTime();
      };

      return getDate(a.name) - getDate(b.name);
    });
  const file = sortedFiles[previewFileIndex];
  if (!file) return null;

  const isPdf = file.name.toLowerCase().endsWith(".pdf");
  const isImage = file.type === "image";

  const close = () => setPreviewFileIndex(null);

  const prev = () =>
    setPreviewFileIndex(
      (prevIndex) =>
        prevIndex === null ? null : (prevIndex - 1 + sortedFiles.length) % sortedFiles.length
    );

  const next = () =>
    setPreviewFileIndex(
      (prevIndex) => (prevIndex === null ? null : (prevIndex + 1) % sortedFiles.length)
    );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-5xl h-[95vh] rounded-xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-50">
          <span className="font-medium truncate max-w-[70%]">{file.name}</span>

          <div className="flex items-center gap-2">
            <a
              href={file.url}
              download={file.name}
              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Download
            </a>

            <button
              onClick={close}
              className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Viewer (takes remaining height) */}
        <div className="flex-1 bg-gray-100">
          {isPdf ? (
            <iframe
              src={`${file.url}#toolbar=1`}
              title={file.name}
              className="w-full h-full"
            />
          ) : isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="object-contain w-full h-full"
            />
          ) : (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                file.url
              )}`}
              title={file.name}
              className="w-full h-full border-none"
            />
          )}
        </div>

        {/* Navigation */}
        {sortedFiles.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-5 top-1/2 -translate-y-1/2 bg-black/70 text-white w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/90"
            >
              ◀
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-5 top-1/2 -translate-y-1/2 bg-black/70 text-white w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/90"
            >
              ▶
            </button>
          </>
        )}
      </div>
    </div>
  );
}