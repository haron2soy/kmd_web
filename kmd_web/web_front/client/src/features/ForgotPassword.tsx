import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { ScrolltoHeader } from "./user_authentication/ScrolltoHeader";

export default function ForgotPassword() {
  const { headerRef } = ScrolltoHeader<HTMLDivElement>(80);
    //<header ref={headerRef} 
   useEffect(() => {
    document.title = "Reset-Password | RSMC Nairobi";
  }, []);
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      await apiClient.post("/auth/forgot-password/", {
        email: email.trim().toLowerCase(),
      });

      // Always show success message (prevent user enumeration)
      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-2 md:py-16">
      <div ref={headerRef} className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="bg-primary text-primary-foreground px-8 py-2 text-center">
          <h2 className="text-2xl font-bold">Reset Password</h2>
          <p className="mt-2 text-sm opacity-80">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {submitted ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 text-sm rounded">
              If an account exists with that email, a password reset link has been sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email address
                </label>

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 rounded-lg font-medium hover:bg-accent/90 transition disabled:opacity-60"
              >
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center text-sm">
                <a href="/login" className="text-accent hover:underline">
                  Back to login
                </a>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}