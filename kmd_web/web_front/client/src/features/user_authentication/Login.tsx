import { useState, useEffect } from "react";
import {Link} from "wouter";
import { useLocation } from "wouter";
import { useAuth } from "./AuthContext";
import { Loader2 } from "lucide-react"; // ← add lucide-react if not already installed
import { ScrolltoHeader } from "./ScrolltoHeader";

export default function Login() {
  const { headerRef } = ScrolltoHeader<HTMLDivElement>(80);
  //<header ref={headerRef} className="mb-4 md:mb-4"></header>
  const { login } = useAuth();
  const [, navigate] = useLocation();
   useEffect(() => {
    document.title = "Login | RSMC Nairobi";
  }, []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username.trim(), password);
      navigate("/", { replace: true }); // replace history entry for better UX
    } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message);
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } finally {
          setIsLoading(false);
        }
    }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-start justify-center px-4 border border-red py-4 md:py-8">
      {/* Card container – centered and max-width constrained */}
      <div ref={headerRef} className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-0">
        {/* Header area */}
        <div className="bg-primary text-primary-foreground px-6 py-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight">RSMC Login</h2>
          <p className="mt-2 text-primary-foreground/80 text-sm">
            Sign in to access forecasting tools and products
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pt-8 pb-10 space-y-2">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded-r text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Username / Email field */}
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`
                block w-full rounded-lg border border-gray-300 px-4 py-3 
                text-gray-900 placeholder-gray-400 
                focus:border-accent focus:ring-2 focus:ring-accent/30 
                outline-none transition-all
              `}
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`
                block w-full rounded-lg border border-gray-300 px-4 py-3 
                text-gray-900 placeholder-gray-400 
                focus:border-accent focus:ring-2 focus:ring-accent/30 
                outline-none transition-all
              `}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full flex items-center justify-center gap-2 
              bg-primary hover:bg-primary/90 
              text-primary-foreground font-medium 
              py-3 px-4 rounded-lg shadow 
              transition-all focus:outline-none focus:ring-2 focus:ring-accent/40
              disabled:opacity-60 disabled:cursor-not-allowed
            `}
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          {/* Other links */}
            <div className="text-center text-sm text-gray-900 space-y-2 pt-2">
              <Link href="/forgot-password" className="text-accent hover:underline">
                Forgot your password?
              </Link>

              <p>
                Not registered?{" "}
                <Link
                  href="/register"
                  className="text-accent hover:underline font-medium"
                >
                  Register here
                </Link>
              </p>
            </div>
        </form>
      </div>
    </div>
  );
}