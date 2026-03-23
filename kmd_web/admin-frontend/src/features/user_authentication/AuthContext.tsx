import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios global config
axios.defaults.baseURL = "https://admin.site.com/api";
axios.defaults.withCredentials = true; // important for Django session auth

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user (session check)
  const fetchUser = async () => {
    try {
      const res = await axios.get("/auth/me/");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      await axios.post("/auth/login/", { username, password });
      await fetchUser();
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout/");
    } finally {
      setUser(null);
    }
  };

  const isAdmin = !!user?.is_staff || !!user?.is_superuser;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}