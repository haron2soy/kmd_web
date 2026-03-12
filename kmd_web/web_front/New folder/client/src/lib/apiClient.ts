// src/lib/apiClient.ts

import axios, {
  AxiosError,
 type AxiosInstance,
 type InternalAxiosRequestConfig,
} from "axios";

// ────────────────────────────────────────────────
// CSRF Helper
// ────────────────────────────────────────────────

function getCSRFToken(): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));

  return match ? match.split("=")[1] : undefined;
}

// ────────────────────────────────────────────────
// Axios Instance
// ────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api", // proxy-friendly
  withCredentials: true, // required for Django session auth
  headers: {
    "Content-Type": "application/json",
  },
});

// ────────────────────────────────────────────────
// Request Interceptor (Attach CSRF)
// ────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase();

    const unsafeMethods = ["POST", "PUT", "PATCH", "DELETE"];

    if (method && unsafeMethods.includes(method)) {
      const token = getCSRFToken();
      if (token) {
        config.headers.set("X-CSRFToken", token);
      }
    }

    return config;
  }
);

// ────────────────────────────────────────────────
// Response Interceptor (Normalize Errors)
// ────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response) {
      // Backend returned an error response (400, 401, etc.)
      return Promise.reject(error.response.data);
    }

    if (error.request) {
      // No response received (network error)
      return Promise.reject({
        detail: "Network error. Please check your connection.",
      });
    }

    // Something unexpected happened
    return Promise.reject({
      detail: "Unexpected error occurred.",
    });
  }
);

export default apiClient;