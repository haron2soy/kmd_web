import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import apiClient from "@/lib/apiClient";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const [, params] = useRoute("/reset-password/:uid/:token");

  const [password, setPassword] = useState("");
  //const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  //const [showConfirm] = useState(false);
  
  const [confirmPassword, setConfirmPassword] = useState<string>(""); // input value
  const [showConfirm, setShowConfirm] = useState<boolean>(false); // visibility toggle

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = password.length >= 8 && password === confirmPassword;

  useEffect(() => {
    document.title = "Reset Password | RSMC Nairobi";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setMessage("");

    try {
      await apiClient.post("/auth/reset-password/", {
        uid: params?.uid,
        token: params?.token,
        password: password, // ← more conventional field name
      });

      setStatus("success");
      setMessage("Your password has been reset successfully.");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail 
        || err?.response?.data?.non_field_errors?.[0]
        || "Invalid or expired reset link. Please request a new one.";

      setStatus("error");
      setMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 bg-white shadow-xl rounded-2xl p-8 md:p-10 border border-gray-100">

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {message && (
          <div
            className={`flex items-center gap-3 rounded-lg p-4 text-sm ${
              status === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
            role="alert"
          >
            {status === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        {status !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-4 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-4 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`
                w-full flex items-center justify-center gap-2 
                py-3 px-4 rounded-lg font-medium text-white 
                transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  isValid && !isSubmitting
                    ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                    : "bg-gray-400 cursor-not-allowed"
                }
              `}
            >
              {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {status === "success" && (
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Your password has been reset. You can now{" "}
                <a
                  href="/login"
                  className="text-indigo-600 hover:underline font-medium"
                >
                  sign in
                </a>
                .
              </p>
            </div>
          )}
      </div>
    </div>
  );
}