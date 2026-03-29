import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import apiClient from "@/lib/apiClient";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type Status = "idle" | "success" | "error";

export default function ResetPassword() {
  const [, params] = useRoute("/reset-password/:uid/:token");

  // ---- Link validation state ----
  const [isChecking, setIsChecking] = useState(true);
  const [isLinkValid, setIsLinkValid] = useState<boolean>(false);

  // ---- Form state ----
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ---- UI state ----
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | string[]>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = password.length >= 8 && password === confirmPassword;

  // ---- Page title ----
  useEffect(() => {
    document.title = "Reset Password | RSMC Nairobi";
  }, []);

  // ---- Validate token on load ----
  useEffect(() => {
    if (status === "success") return;
    async function validateToken() {
      try {
        await apiClient.post("/auth/validate-reset-token/", {
          uidb64: params?.uid,
          token: params?.token,
        });

        setIsLinkValid(true);
      } catch {
        setIsLinkValid(false);
        setStatus("error");
        setMessage("This reset link is invalid or has expired.");
      } finally {
        setIsChecking(false);
      }
    }

    if (params?.uid && params?.token) {
      validateToken();
    } else {
      setIsChecking(false);
      setIsLinkValid(false);
    }
  }, [params]);

  // ---- Submit handler ----
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValid) {
      setStatus("error");
      setMessage(
        password !== confirmPassword
          ? "Passwords do not match."
          : "Password must be at least 8 characters long."
      );
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setMessage("");
    setIsLinkValid(true);

    try {
      const res = await apiClient.post("/auth/reset-password/", {
        uidb64: params?.uid,
        token: params?.token,
        password,
        confirm_password: confirmPassword,
      });

      setStatus("success");
      setMessage(res.data.message || "Password reset successful.");
    } catch (err: any) {
      const errorData = err?.response?.data?.error;

      if (errorData) {
        setMessage(
          errorData.details
            ? [errorData.message, ...errorData.details]
            : errorData.message
        );
      } else {
        setMessage("Invalid or expired reset link. Please request a new one.");
      }

      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---- Message renderer ----
  const renderMessage = () => {
    if (!message) return null;

    if (Array.isArray(message)) {
      return message.map((m, i) => <div key={i}>{m}</div>);
    }

    return message;
  };

  // =========================================================
  // UI STATES
  // =========================================================

  // ---- Loading state ----
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  // ---- Invalid link ----
  if (!isLinkValid && status !== "success") {
    return (
      <div className="min-h-screen flex pt-0 justify-center items-start px-4 py-0 md:py-0">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid or Expired Link
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            This password reset link is no longer valid. Please request a new one.
          </p>

          <a
            href="/forgot-password"
            className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
          >
            Request New Link
          </a>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN FORM
  // =========================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Feedback */}
        {message && (
          <div
            className={`flex gap-3 rounded-lg p-4 text-sm ${
              status === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <div>{renderMessage()}</div>
          </div>
        )}

        {status !== "success" ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <PasswordField
              id="password"
              label="New Password"
              value={password}
              onChange={setPassword}
              visible={showPassword}
              toggle={() => setShowPassword(!showPassword)}
            />

            {/* Confirm Password */}
            <PasswordField
              id="confirm-password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirm}
              toggle={() => setShowConfirm(!showConfirm)}
            />

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-white ${
                isValid && !isSubmitting
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Your password has been reset. You can now{" "}
              <a href="/" className="text-indigo-600 hover:underline font-medium">
                sign in
              </a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================
// Reusable Password Field Component
// =========================================================

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  toggle,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  visible: boolean;
  toggle: () => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          minLength={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2.5 px-4 pr-10"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {visible ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}