// src/shared/components/FileViewer.tsx  (or wherever it lives)
import React from "react";
import { FileText, File, FileSpreadsheet, FileDigit, Download } from "lucide-react";

interface FileViewerProps {
  title: string;
  description?: string;
  fileUrl: string;
  fileType?: "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | string; // more specific types are better
}

export const FileViewer: React.FC<FileViewerProps> = ({
  title,
  description,
  fileUrl,
  fileType = "file",
}) => {
  // Choose icon based on file type
  const getFileIcon = () => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return <FileDigit className="h-10 w-10 text-red-600" />;
    if (type.includes("doc") || type.includes("word")) return <FileText className="h-10 w-10 text-blue-700" />;
    if (type.includes("xls") || type.includes("sheet")) return <FileSpreadsheet className="h-10 w-10 text-green-700" />;
    if (type.includes("ppt") || type.includes("powerpoint")) return <File className="h-10 w-10 text-orange-600" />;
    return <File className="h-10 w-10 text-gray-600" />;
  };

  const getButtonLabel = () => {
    const type = fileType.toUpperCase();
    if (type.includes("PDF")) return "Open PDF";
    if (type.includes("DOC") || type.includes("WORD")) return "Open Word Document";
    if (type.includes("XLS") || type.includes("SHEET")) return "Open Spreadsheet";
    return `Open ${type} File`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Optional header area inside the card */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>

      {/* Main viewer / download area */}
      <div className="p-8 flex flex-col items-center justify-center space-y-6 min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          {getFileIcon()}
          <p className="text-center text-gray-700 max-w-md">
            {description || "Click the button below to view or download the file."}
          </p>
        </div>

        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        >
          <Download className="h-5 w-5" />
          {getButtonLabel()}
        </a>
      </div>
    </div>
  );
};