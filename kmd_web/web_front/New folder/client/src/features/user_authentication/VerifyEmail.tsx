import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "./AuthContext";

export default function VerifyEmail() {
  const { token } = useParams();
  const [location, navigate] = useLocation();

  const { verifyWithToken, verifyWithCode, resendVerification } = useAuth();

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  // ✅ Safe query parsing
  const queryString = location.includes("?") ? location.split("?")[1] : "";
  const queryParams = new URLSearchParams(queryString);
  const email = queryParams.get("email");

  // ────────────────────────────────────────────────
  // Auto verify via token
  // ────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;

    let isMounted = true; // prevent state updates after unmount

    const verify = async () => {
      try {
        setLoading(true);
        setError("");

        await verifyWithToken(token);

        if (!isMounted) return;

        setMessage("Account verified successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } catch (err: any) {
          const msg =
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Verification failed.";

          setError(msg);
        } finally {
        if (isMounted) setLoading(false);
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token, navigate, verifyWithToken]);

  // ────────────────────────────────────────────────
  // Manual Code Verification
  // ────────────────────────────────────────────────

  const handleManualVerify = async () => {
    if (!code.trim()) {
      setError("Please enter a verification code.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await verifyWithCode(code);

      setMessage("Account verified successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // Resend Email
  // ────────────────────────────────────────────────

  const handleResend = async () => {
    if (!email) {
      setError("Missing email address.");
      return;
    }

    try {
      setResendLoading(true);
      setError("");

      await resendVerification(email);

      setMessage("Verification email resent.");
    } catch {
      setError("Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // UI
  // ────────────────────────────────────────────────

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg mt-12">
      <h1 className="text-xl font-semibold mb-4 text-center">
        Verify Your Email
      </h1>

      {loading && <p className="text-center">Verifying...</p>}

      {!token && (
        <>
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />

          <button
            onClick={handleManualVerify}
            disabled={loading}
            className="w-full bg-accent text-white py-2 rounded hover:opacity-90"
          >
            Verify Code
          </button>
        </>
      )}

      {email && (
        <button
          onClick={handleResend}
          disabled={resendLoading}
          className="w-full mt-4 text-sm text-accent hover:underline"
        >
          {resendLoading ? "Resending..." : "Resend verification email"}
        </button>
      )}

      {message && (
        <p className="text-green-600 mt-4 text-center">{message}</p>
      )}

      {error && (
        <p className="text-red-600 mt-4 text-center">{error}</p>
      )}
    </div>
  );
}