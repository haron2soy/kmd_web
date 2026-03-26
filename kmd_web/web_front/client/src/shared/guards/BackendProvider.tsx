// src/shared/guards/BackendProvider.tsx
import { useEffect, useRef } from "react";
import { useBackendStatus } from "./BackendStatus";
import apiClient from "@/lib/apiClient";

const FAST_INTERVAL = 5000;   // first 3 retries
const SLOW_INTERVAL = 30000;  // afterwards
const FAST_RETRIES = 3;

export function BackendProvider({ children }: { children: React.ReactNode }) {
  const { status, setStatus } = useBackendStatus();

  const retryRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const isRetryingRef = useRef(false);

  // ─────────────────────────────────────────────
  // Online / Offline detection
  // ─────────────────────────────────────────────
  useEffect(() => {
    const goOffline = () => {
      stopRetry();
      setStatus("down");
    };
    const goOnline = () => {
      setStatus("checking");
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, [setStatus]);

  // ─────────────────────────────────────────────
  // Initial health check
  // ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const res = await apiClient.get("/health/");
        if (!cancelled) setStatus(res.status === 200 ? "up" : "down");
      } catch {
        if (!cancelled) setStatus("down");
      }
    };
    init();
    return () => { cancelled = true; };
  }, [setStatus]);

  // ─────────────────────────────────────────────
  // Retry loop for down / checking
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (status !== "down" && status !== "checking") {
      stopRetry();
      retryCountRef.current = 0;
      return;
    }

    if (isRetryingRef.current) return;

    isRetryingRef.current = true;

    const scheduleRetry = () => {
      const interval =
        retryCountRef.current < FAST_RETRIES
          ? FAST_INTERVAL
          : SLOW_INTERVAL;

      retryRef.current = window.setTimeout(async () => {
        try {
          const res = await apiClient.get("/health/", { timeout: 4000 });
          if (res.status === 200) {
            setStatus("up");
            retryCountRef.current = 0;
            stopRetry();
            return;
          }
        } catch {
          // ignore, status remains down
        }

        // increment retry count after each attempt
        retryCountRef.current++;
        scheduleRetry(); // schedule next retry properly
      }, interval);
    };

    scheduleRetry();

    return () => stopRetry();
  }, [status, setStatus]);

  // ─────────────────────────────────────────────
  // Cleanup helper
  // ─────────────────────────────────────────────
  const stopRetry = () => {
    if (retryRef.current) {
      clearTimeout(retryRef.current);
      retryRef.current = null;
    }
    isRetryingRef.current = false;
  };

  return <>{children}</>;
}