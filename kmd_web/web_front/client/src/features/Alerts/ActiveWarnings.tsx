// ActiveWarnings.tsx
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CloudRain, Wind, Anchor, Sun, Plane, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

import type { Warning } from "./index";

const ICONS: Record<string, any> = {
  CloudRain,
  Wind,
  Anchor,
  Sun,
  Plane,
  AlertTriangle,
} as const;

const colorMap = {
  red:    { border: "border-red-500",    icon: "text-red-600"    },
  yellow: { border: "border-yellow-500", icon: "text-yellow-600" },
  orange: { border: "border-orange-500", icon: "text-orange-600" },
  // extend as needed
} as const;

export default function ActiveWarnings() {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/warnings/active/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch warnings");
        return res.json() as Promise<Warning[]>;
      })
      .then((data) => {
        const sorted = data.sort((a, b) =>
          b.priority !== a.priority
            ? b.priority - a.priority
            : new Date(b.start_at).getTime() - new Date(a.start_at).getTime()
        );
        setWarnings(sorted);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load active warnings");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-28 animate-pulse bg-gray-100/60 rounded-lg" />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-50 border-l-4 border-red-500 rounded">
        {error}
      </div>
    );
  }

  const now = Date.now();

  return (
    <section className="space-y-5" aria-label="Active weather or safety warnings">
      <h3 className="font-serif font-bold text-xl tracking-tight">Active Warnings</h3>

      {warnings.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500 text-sm">
          No active warnings at the moment.
          <br />
          <span className="text-gray-400">Stay safe!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {warnings.map((w) => {
            const Icon = ICONS[w.icon] ?? AlertTriangle;
            const style = colorMap[w.color as keyof typeof colorMap] ?? {
              border: "border-gray-400",
              icon: "text-gray-500",
            };
            const isNew = new Date(w.start_at).getTime() > now - 86400000; // 24h
            const isExpanded = expandedId === w.id;
            const messageTooLong = w.message.length > 120; // or count lines/words

            return (
              <article
                key={w.id}
                className={`
                  bg-white border-l-4 ${style.border} shadow-sm rounded-r-md
                  transition-all duration-200 hover:shadow
                  ${isExpanded ? "ring-2 ring-offset-1 ring-blue-400/60" : "hover:bg-gray-50"}
                `}
              >
                <div className="p-3 flex gap-3">
                  <Icon
                    aria-hidden="true"
                    className={`h-5 w-5 ${style.icon} flex-shrink-0 mt-1`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <strong className="font-medium text-gray-900 truncate">
                        {w.title}
                      </strong>
                      {isNew && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded-full">
                          NEW
                        </span>
                      )}
                    </div>

                    <div
                      className={`
                        text-sm text-gray-700
                        ${isExpanded ? "" : "line-clamp-2"}
                        ${messageTooLong ? "cursor-pointer" : ""}
                      `}
                      onClick={() => messageTooLong && setExpandedId(isExpanded ? null : w.id)}
                      role={messageTooLong ? "button" : undefined}
                      tabIndex={messageTooLong ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (messageTooLong && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          setExpandedId(isExpanded ? null : w.id);
                        }
                      }}
                    >
                      {w.message}
                    </div>

                    {messageTooLong && (
                      <button
                        type="button"
                        className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        onClick={() => setExpandedId(isExpanded ? null : w.id)}
                      >
                        {isExpanded ? (
                          <>
                            Show less <ChevronUp className="h-3.5 w-3.5" />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDown className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    )}

                    <time className="mt-2 text-xs text-gray-500 block">
                      {formatDistanceToNow(new Date(w.start_at), { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}