import { useState } from "react";
import { useLocation, Link } from "wouter";
import apiClient from "@/lib/apiClient";
import "./Register.css";

interface RegisterForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

interface FieldErrors {
  first_name?: string[];
  last_name?: string[];
  email?: string[];
  password?: string[];
  password_confirm?: string[];
  non_field_errors?: string[];
}

export default function Register() {
  const [, navigate] = useLocation();

  const [form, setForm] = useState<RegisterForm>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  // ────────────────────────────────────────────────
  // Handle Input Change
  // ────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear only the modified field error
    setErrors((prev) => {
      if (!prev[name as keyof FieldErrors]) return prev;

      const updated = { ...prev };
      delete updated[name as keyof FieldErrors];
      return updated;
    });
  };

  // ────────────────────────────────────────────────
  // Client-Side Validation
  // ────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (form.password.length < 8) {
      newErrors.password = ["Password must be at least 8 characters."];
    }

    if (form.password !== form.password_confirm) {
      newErrors.password_confirm = ["Passwords do not match."];
    }

    if (!form.first_name.trim()) {
      newErrors.first_name = ["First name is required."];
    }

    if (!form.last_name.trim()) {
      newErrors.last_name = ["Last name is required."];
    }

    if (!form.email.trim()) {
      newErrors.email = ["Email is required."];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ────────────────────────────────────────────────
  // Submit
  // ────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return; // Prevent double submit

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      await apiClient.post("/auth/register/", form);

      navigate(
        `/verify-email?email=${encodeURIComponent(form.email)}`,
        { replace: true }
      );
    } catch (err: any) {
      const data = err?.response?.data;

      if (data && typeof data === "object") {
        setErrors(data as FieldErrors);
      } else {
        setErrors({
          non_field_errors: ["Unexpected error. Please try again."],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // UI
  // ────────────────────────────────────────────────

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Create Account</h1>
        <p className="subtitle">Join us and start exploring</p>

        <form onSubmit={handleSubmit} noValidate className="register-form">
          {/* First Name */}
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={form.first_name}
              onChange={handleChange}
              required
              autoFocus
            />
            {errors.first_name && (
              <div className="error-message">
                {errors.first_name.join(" • ")}
              </div>
            )}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={form.last_name}
              onChange={handleChange}
              required
            />
            {errors.last_name && (
              <div className="error-message">
                {errors.last_name.join(" • ")}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            {errors.email && (
              <div className="error-message">
                {errors.email.join(" • ")}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
            {errors.password && (
              <div className="error-message">
                {errors.password.join(" • ")}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="password_confirm">Confirm Password</label>
            <input
              id="password_confirm"
              name="password_confirm"
              type="password"
              value={form.password_confirm}
              onChange={handleChange}
              required
            />
            {errors.password_confirm && (
              <div className="error-message">
                {errors.password_confirm.join(" • ")}
              </div>
            )}
          </div>

          {/* Non-field errors */}
          {errors.non_field_errors && (
            <div className="error-block">
              {errors.non_field_errors.map((msg, i) => (
                <p key={i}>{msg}</p>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}