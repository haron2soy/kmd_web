// src/lib/apiClient.ts

import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { BackendNetwork } from "./BackendNetwork";
// ────────────────────────────────────────────────
// Unauthorized handler (for global logout redirect)
// ────────────────────────────────────────────────

let onUnauthorized: (() => void) | null = null;
let isHandlingUnauthorized = false;

export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

// ────────────────────────────────────────────────
// CSRF Helper
// ────────────────────────────────────────────────

function getCSRFToken(): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));

  return match ? match.split("=")[1] : undefined;
}

// Ensure CSRF cookie is set once
let csrfInitialized = false;



// ────────────────────────────────────────────────
// Axios Instance
// ────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true, // 🔥 required for Django sessions
  headers: {
    "Content-Type": "application/json",
  },
});

BackendNetwork(apiClient);

export async function checkingCSRF() {
  if (!csrfInitialized) {
    //await apiClient.get("/csrf-token/");
    await apiClient.get("/csrf/");
    csrfInitialized = true;
  }
}
// ────────────────────────────────────────────────
// Request Interceptor (Attach CSRF token)
// ────────────────────────────────────────────────

apiClient.interceptors.request.use(

  (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase();

    const unsafeMethods = ["POST", "PUT", "PATCH", "DELETE"];

    if (method && unsafeMethods.includes(method)) {
      const token = getCSRFToken();
      if (token) {
        config.headers["X-CSRFToken"] = token;
      }
    }

    return config;
  }
);

// ────────────────────────────────────────────────
// Response Interceptor (Handle errors globally)
// ────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || "";

      // Handle unauthorized globally
      if (
        status === 401 &&
        !url.includes("/session") &&
        !url.includes("/logout") &&
        !isHandlingUnauthorized
      ) {
        isHandlingUnauthorized = true;

        onUnauthorized?.();

        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 1000);
      }

      return Promise.reject(error);
    }

    if (error.request) {
      return Promise.reject({
        detail: "Network error. Please check your connection.",
      });
    }

    return Promise.reject({
      detail: "Unexpected error occurred.",
    });
  }
);

// ────────────────────────────────────────────────
// Auth API helpers
// ────────────────────────────────────────────────

export async function loginRequest(data: {
  username: string;
  password: string;
}) {
  await checkingCSRF();
  return apiClient.post("/login/", data);
}

export async function logoutRequest() {
  try {
    await checkingCSRF();
    await apiClient.post("/logout/");
  } catch {
    // Ignore logout errors (user may already be logged out)
  }
}

export async function getSession() {
  return apiClient.get("/session/");
}

// ────────────────────────────────────────────────

export default apiClient;