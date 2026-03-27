import { useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useLocation } from "wouter";
import {checkingCSRF} from "@/lib/apiClient";
import { Button } from "@/shared/components/ui/button";

interface LogoutButtonProps {
  className?: string;
}
export default function LogoutButton({ className }: LogoutButtonProps) {
  const { logout, clearAuthState } = useAuth(); 
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    if (loading) return; // prevent double clicks

    setLoading(true);

    try {
      // Attempt backend logout (best effort)
      await checkingCSRF();
      await logout();
    } catch (error) {
      //console.warn("Logout request failed:", error);
      
    } finally {
      // Always clear frontend state
      clearAuthState();

      // Optional: clear storage
      localStorage.removeItem("auth");
      sessionStorage.clear();

      // Navigate AFTER cleanup
      navigate("/login", { replace: true });

      setLoading(false);
    }
  }, [loading, logout, clearAuthState, navigate]);

  return (
    <Button 
      onClick={handleLogout} 
      disabled={loading} 
      variant="default" // or "secondary", "destructive", etc.
      size="default"
      className={className}
    >
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
}