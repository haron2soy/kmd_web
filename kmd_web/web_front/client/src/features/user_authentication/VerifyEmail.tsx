import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useAuth } from "./AuthContext";
import { ScrolltoHeader } from "./ScrolltoHeader";


export default function VerifyEmail() {
  const { headerRef } = ScrolltoHeader<HTMLDivElement>(80);
  const { token } = useParams();
  const [, navigate] = useLocation();
  const [countdown, setCountdown] = useState(0);
  const { verifyWithToken, verifyWithCode, resendVerification } = useAuth();

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  
  //const {error, setError} = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [showResendInput, setShowResendInput] = useState(false);

  const [resendEmail, setResendEmail] = useState("");



  // ✅ Safe query parsing
  //const queryString = location.includes("?") ? location.split("?")[1] : "";
  //const queryParams = new URLSearchParams(queryString);
  //const email = queryParams.get("email");


  // ────────────────────────────────────────────────
  // Auto verify via token
  // ────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;

    let isMounted = true; // prevent state updates after unmount

    const verify = async () => {
      try {
        setLoading(true);
        //setError("");

        await verifyWithToken(token);

        if (!isMounted) return;

        setMessage("Account verified successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } catch (err: any) {
          const msg =
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.response?.data?.non_field_errors?.[0] ||
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

useEffect(() => {
  if (countdown <= 0) return;  // Stop if already done

  const timer = setTimeout(() => {
    setCountdown((prev) => {
      const newVal = prev - 1;
      if (newVal <= 0) return 0;  // Ensure exact 0
      return newVal;
    });
  }, 1000);  // Smooth 1-second ticks

  return () => clearTimeout(timer);
}, [countdown]);

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
      setMessage("");

      await verifyWithCode(code);

      setMessage("Account verified successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      // Same error extraction as token verification
      const msg = 
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.non_field_errors?.[0] ||
        "Invalid verification code.";
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // Resend Email
  // ────────────────────────────────────────────────
const handleResend = async (email: string) => {
  if (!email) {
    setError("Please enter your email.");
    return;
  }

  // Start countdown immediately
  //setCountdown(60);
  setResendLoading(true);
  setError("");
  setMessage(""); // clear previous messages
  setShowResendInput(false);

  try {
    const res = await resendVerification(email);

    // Ensure res has proper structure
    if (res?.success) {
      setMessage(res.message);
      setCountdown(60);
    } else {
      setError(res?.message || "Failed to resend verification email.");
    }
  } catch (err: any) {
    setError(err?.message || "Failed to resend verification email.");
  } finally {
    setResendLoading(false);
  }
};
  // ────────────────────────────────────────────────
  // UI
  // ────────────────────────────────────────────────

  return (
  <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg mt-12">
    <h1 ref={headerRef} className="text-xl font-semibold mb-4 text-center">
      Verify Your Email
    </h1>

    {loading && <p className="text-center text-gray-600">Verifying...</p>}

    {/* ─── Auto-verify with token ─── */}
    {token && (
      <div className="text-center mb-6">
        {error ? (
          <p className="text-red-600 mb-4">{error}</p>
        ) : (
          <p className="text-gray-600">Verifying your email...</p>
        )}
      </div>
    )}
    {/*error && <div className="text-red-500">{error}</div>*/}
    {/* ─── Manual code entry (when no token or token failed) ─── */}
    {message && <div className="text-green-500">{message}</div>}
    {!token && (
      <>
        <input
          type="text"
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <button
          onClick={handleManualVerify}
          disabled={loading || !code.trim()}
          className="w-full bg-accent text-white py-3 rounded font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </>
    )}

    {/* ─── Resend area ─── always visible ─── */}
    <div className="mt-8 text-center">
      {!showResendInput ? (
        <button
          onClick={() => {
            setShowResendInput(true);
            //setCountdown(60); // start cooldown immediately
          }}
          disabled={resendLoading || countdown > 0}
          className={`w-full text-sm font-medium px-4 py-2 rounded transition-colors
            ${countdown > 0 || resendLoading
              ? "text-gray-400 cursor-not-allowed bg-gray-100"
              : "bg-accent text-white hover:bg-accent/90"
            }`}
        >
          {countdown > 0 ? `Resend available in ${countdown}s` : "Resend verification"}
        </button>
      ) : (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />

          <button
            onClick={() => handleResend(resendEmail)}
            disabled={resendLoading || !resendEmail || countdown > 0}
            className={`w-full text-sm font-medium px-4 py-2 rounded transition-colors
              ${resendLoading || !resendEmail || countdown > 0
                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                : "bg-accent text-white hover:bg-accent/90"
              }`}
          >
            {resendLoading ? "Sending new email..." : countdown > 0
    ? `Resend available in ${countdown}s`: "Send verification email"}
          </button>
        </>
      )}


      {/* Small status line – helps user understand why it's disabled */}
      {/*countdown > 0 && !resendLoading && (
        <p className="text-xs text-gray-500 mt-2.5">
          A new code was just sent.
        </p>
      )*/}

      {resendLoading && (
        <p className="text-xs text-gray-500 mt-2.5">
          Sending new verification email…
        </p>
      )}

      {/* Only show this rare case as informational text – not as a blocker */}
      
      {/* Optional helpful text */}
      {/*countdown > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          Verification link and code has been sent. 
        </p>
      )*/}
        {countdown > 0 && message && (
            <p className="text-green-600 mt-6 text-center font-medium">{message}</p>
          )}

          {countdown > 0 && error && !loading && (
            <p className="text-red-600 mt-6 text-center">{error}</p>
          )}
      {!token && (
        <p className="text-sm text-gray-700 mt-3">
          Click the verification link on your Email or Enter the verification code.
          <br />
          Go back to the <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">Sign up</Link> page.
        </p>
      )}
    </div>
  </div>
);
}