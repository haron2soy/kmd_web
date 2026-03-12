import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useLocation } from "wouter";
import apiClient from "@/lib/apiClient";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface User {
  id: number;
  username: string;
  email: string;
}

interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;

  isAuthenticated: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => Promise<void>;

  verifyWithToken: (token: string) => Promise<void>;
  verifyWithCode: (code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;

  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────
// Error Helper
// ─────────────────────────────────────────

function extractError(err: unknown, fallback: string) {
  const data = (err as any)?.response?.data;

  if (!data) return fallback;

  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;

  if (typeof data === "object") {
    return Object.values(data).flat().join(" ");
  }

  return fallback;
}

// ─────────────────────────────────────────
// Provider
// ─────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────
  // Generic request wrapper
  // ─────────────────────────────────────────

  const request = useCallback(async (fn: () => Promise<any>, fallback: string) => {
    try {
      setError(null);
      return await fn();
    } catch (err) {
      const message = extractError(err, fallback);
      setError(message);
      throw err;
    }
  }, []);

  // ─────────────────────────────────────────
  // Refresh Session
  // ─────────────────────────────────────────

  const refreshSession = useCallback(async () => {
    try {
      const res = await apiClient.get<SessionResponse>("/session/");

      setUser(res.data.authenticated ? res.data.user ?? null : null);
    } catch {
      setUser(null);
    }
  }, []);

  // ─────────────────────────────────────────
  // Initial Load
  // ─────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      try {
        await apiClient.get("/csrf/");
        await refreshSession();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [refreshSession]);

  // ─────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────

  const login = useCallback(
    async (username: string, password: string) => {
      await request(
        () => apiClient.post("/login/", { username, password }),
        "Login failed"
      );

      await refreshSession();

      navigate("/", { replace: true });
    },
    [navigate, refreshSession, request]
  );

  // ─────────────────────────────────────────
  // Register
  // ─────────────────────────────────────────

const register = useCallback(
  async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    try {
      const res = await apiClient.post("/auth/register/", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirm: passwordConfirm,
      });

      return res.data;

    } catch (err: any) {
      console.log("Register error:", err?.response?.data);
      console.log("Register error response:", err?.response?.data);
      throw err;
    }
  },
  []
);

  // ─────────────────────────────────────────
  // Email Verification
  // ─────────────────────────────────────────

  const verifyWithToken = useCallback(
    async (token: string) => {
      await request(
        () => apiClient.post(`/auth/verify-email/${token}/`),
        "Invalid or expired verification link"
      );
    },
    [request]
  );

  const verifyWithCode = useCallback(
    async (code: string) => {
      await request(
        () => apiClient.post("/auth/verify-code/", { code }),
        "Invalid verification code"
      );
    },
    [request]
  );

  const resendVerification = useCallback(
    async (email: string) => {
      await request(
        () => apiClient.post("/auth/resend-verification/", { email }),
        "Failed to resend verification email"
      );
    },
    [request]
  );

  // ─────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/logout/");
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ─────────────────────────────────────────
  // Refresh session when tab gains focus
  // ─────────────────────────────────────────

  useEffect(() => {
    const onFocus = () => refreshSession();

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshSession]);

  // ─────────────────────────────────────────
  // Context Value
  // ─────────────────────────────────────────

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      error,

      isAuthenticated: !!user,

      login,
      register,

      verifyWithToken,
      verifyWithCode,
      resendVerification,

      logout,
      refreshSession,
    }),
    [
      user,
      loading,
      error,
      login,
      register,
      verifyWithToken,
      verifyWithCode,
      resendVerification,
      logout,
      refreshSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────
// Hook
// ─────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}