// src/shared/guards/BackendGuards.tsx
import { useEffect, useState } from "react";

const TIMEOUT = 20000;
const POLL_INTERVAL = 3000;

type Status = "checking" | "up" | "down";

export function BackendGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const [startTime] = useState(() => Date.now());
  const [, setDownCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let pollId: number;

    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const res = await fetch("/api/health/", {
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!isMounted) return;

        if (res.ok) {
          setStatus("up");
          setDownCount(0); // Reset counter on success
        } else {
          // Only mark as down after 2 consecutive failures
          setDownCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 2 && isMounted) {
              setStatus("down");
            }
            return newCount;
          });
        }
      } catch {
        if (isMounted) {
          // Only mark as down after 2 consecutive failures
          setDownCount(prev => {
            const newCount = prev + 1;
            if (newCount >= 2 && isMounted) {
              setStatus("down");
            }
            return newCount;
          });
        }
      }
    };

    checkBackend();
    pollId = window.setInterval(checkBackend, POLL_INTERVAL);

    return () => {
      isMounted = false;
      window.clearInterval(pollId);
    };
  }, []);

  const elapsed = Date.now() - startTime;
  const hasTimedOut = elapsed >= TIMEOUT;

  if (status === "up") {
    return <>{children}</>;
  }

  if (hasTimedOut) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-blue-600 space-y-4">
        <p className="font-medium text-center">
          Unable to reach the server.
        </p>
        <p className="text-sm text-gray-500 text-center">
          Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-700 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show appropriate loading message
  return (
    <div className="flex h-screen flex-col items-center justify-center text-blue-600">
      <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-800 rounded-full animate-spin"></div>
      
      {/* This will now show both states properly */}
      {status === "checking" ? (
        <p>Connecting to server...</p>
      ) : status === "down" ? (
        <p>Connection lost. Reconnecting...</p>
      ) : (
        <p>Connecting to server...</p> // Fallback
      )}
    </div>
  );
}