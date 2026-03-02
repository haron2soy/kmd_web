import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useLocation } from "wouter";
import apiClient from "@/lib/apiClient";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

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
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  register: (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    password_confirm: string
  ) => Promise<void>;

  verifyWithToken: (token: string) => Promise<void>;
  verifyWithCode: (code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;

  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// ────────────────────────────────────────────────
// Context
// ────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ────────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  // ────────────────────────────────────────────────
  // Utility: Extract backend error safely
  // ────────────────────────────────────────────────

  const extractError = (err: any, fallback: string): string => {
    const data = err?.response?.data;

    if (!data) return fallback;

    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.error) return data.error;

    if (typeof data === "object") {
      return Object.values(data).flat().join(" ");
    }

    return fallback;
  };

  // ────────────────────────────────────────────────
  // Session Initialization
  // ────────────────────────────────────────────────

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.get("/csrf/");
      const response = await apiClient.get<SessionResponse>("/session/");

      if (response.data.authenticated && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // ────────────────────────────────────────────────
  // Login
  // ────────────────────────────────────────────────

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        setError(null);
        await apiClient.post("/login/", { username, password });
        await refreshSession();
        navigate("/", { replace: true });
      } catch (err: any) {
        const message = extractError(err, "Login failed");
        setError(message);
        throw err;
      }
    },
    [refreshSession, navigate]
  );

  // ────────────────────────────────────────────────
  // Register
  // ────────────────────────────────────────────────

  const register = useCallback(
    async (
      first_name: string,
      last_name: string,
      email: string,
      password: string,
      password_confirm: string
    ) => {
      try {
        setError(null);

        await apiClient.post("/auth/register/", {
          first_name,
          last_name,
          email,
          password,
          password_confirm,
        });

        navigate(`/verify-email?email=${encodeURIComponent(email)}`, {
          replace: true,
        });
      } catch (err: any) {
        const message = extractError(err, "Registration failed");
        setError(message);
        throw err;
      }
    },
    [navigate]
  );

  // ────────────────────────────────────────────────
  // Email Verification
  // ────────────────────────────────────────────────

  const verifyWithToken = useCallback(async (token: string) => {
    try {
      setError(null);
      await apiClient.post(`/auth/verify-email/${token}/`);
    } catch (err: any) {
      const message = extractError(err, "Invalid or expired verification link");
      setError(message);
      throw err;
    }
  }, []);

  const verifyWithCode = useCallback(async (code: string) => {
    try {
      setError(null);
      await apiClient.post("/auth/verify-code/", { code });
    } catch (err: any) {
      const message = extractError(err, "Invalid verification code");
      setError(message);
      throw err;
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    try {
      setError(null);
      await apiClient.post("/auth/resend-verification/", { email });
    } catch (err: any) {
      const message = extractError(
        err,
        "Failed to resend verification email"
      );
      setError(message);
      throw err;
    }
  }, []);

  // ────────────────────────────────────────────────
  // Logout
  // ────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      setError(null);
      await apiClient.post("/logout/");
      setUser(null);
      navigate("/login", { replace: true });
    } catch (err: any) {
      const message = extractError(err, "Logout failed");
      setError(message);
      throw err;
    }
  }, [navigate]);

  // ────────────────────────────────────────────────
  // Context Value
  // ────────────────────────────────────────────────

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    error,

    login,
    register,

    verifyWithToken,
    verifyWithCode,
    resendVerification,

    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}