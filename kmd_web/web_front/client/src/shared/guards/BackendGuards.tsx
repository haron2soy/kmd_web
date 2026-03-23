// src/shared/guards/BackendGuards.tsx
import { useEffect, useState } from "react";

export function BackendGuard({ children }: { children: React.ReactNode }) {
  const [backendUp, setBackendUp] = useState(false);
  const [elapsed, setElapsed] = useState(0); // milliseconds

  useEffect(() => {
    let intervalId: number;
    let timerId: number;

    const checkBackend = async () => {
      try {
        const res = await fetch("/api/health/");
        if (res.ok) {
          setBackendUp(true);
        }
      } catch {
        // Backend still down, ignore
      }
    };

    // Start elapsed timer (updates every second)
    timerId = window.setInterval(() => setElapsed((prev) => prev + 1000), 1000);

    // Check backend immediately and then every 10 seconds
    checkBackend();
    intervalId = window.setInterval(checkBackend, 10000);

    return () => {
      window.clearInterval(intervalId);
      window.clearInterval(timerId);
    };
  }, []);

  if (backendUp) {
    // Backend is ready, render children
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center text-red-600">
      {/* Spinning circle */}
      <div className="mb-4 animate-spin rounded-full border-4 border-t-4 border-red-600 w-12 h-12"></div>

      {/* Messages based on elapsed time */}
      {elapsed <= 20000 ? (
        <p className="text-center">Backend is starting... please wait</p>
      ) : (
        <p className="text-center">
          Still waiting for the server — try refreshing later.
        </p>
      )}
    </div>
  );
}