//logout.tsx
import { useAuth } from "./AuthContext";
import { useLocation } from "wouter";

export default function LogoutButton() {
  const { logout } = useAuth();
  const [, navigate] = useLocation();

  return (
    <button
      onClick={async () => {
        await logout();
        navigate("/login");
      }}
    >
      Logout
    </button>
  );
}