// src/lib/BackendNetwork.ts
import type { AxiosInstance, AxiosError } from "axios";
import axios from "axios";
import { useBackendStatus } from "@/shared/guards/BackendStatus";

// 🔒 isolated client (NO interceptors)
const healthClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let isCheckingHealth = false;
let lastHealthCheck = 0;

const HEALTHCHECK_COOLDOWN = 3000;

export function BackendNetwork(apiClient: AxiosInstance) {
  async function runHealthCheck() {
    const now = Date.now();

    if (isCheckingHealth) return;
    if (now - lastHealthCheck < HEALTHCHECK_COOLDOWN) return;

    isCheckingHealth = true;
    lastHealthCheck = now;

    try {
      useBackendStatus.getState().setStatus("checking");

      const res = await healthClient.get("/health/");

      if (res.status === 200) {
        useBackendStatus.getState().setStatus("up");
      } else {
        useBackendStatus.getState().setStatus("down");
      }
    } catch {
      useBackendStatus.getState().setStatus("down");
    } finally {
      isCheckingHealth = false;
    }
  }

  apiClient.interceptors.response.use(
    (response) => {
      const isApiRequest = response.config?.url?.startsWith("/");

      if (isApiRequest) {
        useBackendStatus.getState().setStatus("up");
      }

      return response;
    },
    (error: AxiosError<any>) => {
      const url = error.config?.url || "";
      const isApiRequest = url.startsWith("/");

      if (!isApiRequest) {
        return Promise.reject(error);
      }

      const status = error.response?.status;

      const isNetworkError = !error.response;
      const isServerError = status && status >= 500;
      const isTimeout = error.code === "ECONNABORTED";

      if (isNetworkError || isServerError || isTimeout) {
        const current = useBackendStatus.getState().status;

        // 🔥 Trigger system immediately
        if (current === "up") {
          useBackendStatus.getState().setStatus("checking");
        }

        runHealthCheck();
      }

      return Promise.reject(error);
    }
  );
}