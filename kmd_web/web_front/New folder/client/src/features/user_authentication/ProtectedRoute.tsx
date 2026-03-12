import { Route, Redirect } from "wouter";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

type Props = {
  path: string;
  children: ReactNode;
};

export default function ProtectedRoute({ path, children }: Props) {
  const { user, loading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (loading) {
          return <p>Loading...</p>;
        }

        if (!user) {
          return <Redirect to="/login" />;
        }

        return children;
      }}
    </Route>
  );
}