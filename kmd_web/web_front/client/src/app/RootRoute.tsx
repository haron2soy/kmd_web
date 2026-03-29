import { useAuth } from "@/features/user_authentication/AuthContext";
import Home from "@/features/home/Home";
import Login from "@/features/user_authentication/Login";

function RootRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // or spinner
  }

  return isAuthenticated ? <Home /> : <Login />;
}

export default RootRoute;