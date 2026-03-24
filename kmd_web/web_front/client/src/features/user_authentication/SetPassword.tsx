import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import apiClient from "@/lib/apiClient";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function SetPassword() {
  const [, params] = useRoute("/set-password/:uid/:token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | string[]>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = password.length >= 8 && password === confirmPassword;

  useEffect(() => {
    document.title = "Set Password | RSMC Nairobi";
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
      const res = await apiClient.post("/auth/set-password/", {
        uidb64: params?.uid,
        token: params?.token,
        password,
        confirm_password: confirmPassword,
      });

      setStatus("success");
      setMessage(res.data.message || "Your password has been set successfully.");
    } catch (err: any) {
      // Backend returns structured error like { error: { message, details? } }
      const errorData = err?.response?.data?.error;

      if (errorData) {
        // Combine main message and optional details array
        const fullMessage = errorData.details
          ? [errorData.message, ...errorData.details]
          : errorData.message;

        setStatus("error");
        setMessage(fullMessage);
      } else {
        setStatus("error");
        setMessage("Invalid or expired set link. Please request a new one.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderMessage = () => {
    if (!message) return null;

    if (Array.isArray(message)) {
      return message.map((m, idx) => <div key={idx}>{m}</div>);
    }
    return message;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 bg-white shadow-xl rounded-2xl p-8 md:p-10 border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Set Password</h1>
          <p className="mt-2 text-sm text-gray-600">Enter your new password below</p>
        </div>

        {message && (
          <div
            className={`flex flex-col gap-2 rounded-lg p-4 text-sm ${
              status === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
            role="alert"
          >
            <div className="flex items-center gap-3">
              {status === "success" ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{renderMessage()}</span>
            </div>
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
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
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
                  {showConfirm ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isValid && !isSubmitting
                  ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {isSubmitting ? "Setting..." : "Set Password"}
            </button>
          </form>
        )}

        {status === "success" && (
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Your password has been set. You can now{" "}
              <a href="/login" className="text-indigo-600 hover:underline font-medium">
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