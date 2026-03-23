import type { ReactNode } from "react";
import {Navigate } from "react-router-dom";
import { useAuth } from "../../../features/user_authentication/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user || !isAdmin) {
     return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}