// src/shared/guards/BackendGuard.tsx
import { useBackendStatus } from "./BackendStatus";

import { useState, useEffect } from "react";

export function BackendGuard({ children }: { children: React.ReactNode }) {
  const status = useBackendStatus((s) => s.status);
  const [showConnected, setShowConnected] = useState(true);

useEffect(() => {
  if (status === "up") {
    setShowConnected(true);
    const timer = setTimeout(() => {
      setShowConnected(false);
    }, 4000);

    return () => clearTimeout(timer);
  }
}, [status]);

  // 🚨 Backend down UI
  if (status === "down") {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-blue-600 space-y-4">
        <p className="font-medium text-center">
          Connection lost.
        </p>
        <p className="text-sm text-gray-500 text-center">
          Trying to reconnect ...
        </p>
      </div>
    );
  }

  // 🚨 Initial checking state (optional)
  if (status === "checking") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Connecting...</p>
      </div>
    );
  }



  // ✅ Normal app
  return (
    <>
      {children}
      {showConnected && (
      <div className="fixed bottom-4 right-4 bg-white shadow border rounded px-3 py-1 text-sm transition-opacity duration-300">
        Connected
      </div>
      )}
    </>
  );
}