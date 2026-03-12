import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "./AuthContext";
import "./Register.css";
import { ScrolltoHeader } from "./ScrolltoHeader";

interface RegisterForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

type FieldErrors = Partial<Record<keyof RegisterForm, string[]>> & {
  non_field_errors?: string[];
};

const initialForm: RegisterForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  password_confirm: "",
};

export default function Register() {
const { headerRef } = ScrolltoHeader<HTMLDivElement>(80);
  //<header ref={headerRef} 
   useEffect(() => {
    document.title = "Register | RSMC Nairobi";
  }, []);
  const [, navigate] = useLocation();
  const { register } = useAuth();

  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────
  // Handle Input
  // ─────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      if (!prev[name as keyof FieldErrors]) return prev;
      const updated = { ...prev };
      delete updated[name as keyof FieldErrors];
      return updated;
    });
  };

  // ─────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!form.first_name.trim())
      newErrors.first_name = ["First name is required."];

    if (!form.last_name.trim())
      newErrors.last_name = ["Last name is required."];

    if (!form.email.trim()) {
      newErrors.email = ["Email is required."];
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = ["Invalid email address."];
    }

    if (form.password.length < 8)
      newErrors.password = ["Password must be at least 8 characters."];

    if (form.password !== form.password_confirm)
      newErrors.password_confirm = ["Passwords do not match."];

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ─────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      await register(
        form.first_name.trim(),
        form.last_name.trim(),
        form.email.trim(),
        form.password,
        form.password_confirm
      );

      // store email temporarily for verification page
      sessionStorage.setItem("verify_email", form.email);

      navigate("/verify-email", { replace: true });

    } catch (err: any) {
      const data = err?.response?.data || err;

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

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────

  return (
    <div className="register-container">
      <div ref={headerRef} className="register-card ">
        <div className="bg-primary text-primary-foreground px-6 py-2 text-center">
          <h1>Create Account</h1>
          <p className="bg-primary text-center">Join us and start exploring</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="register-form">

          <Field
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            errors={errors.first_name}
            autoFocus
          />

          <Field
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            errors={errors.last_name}
          />

          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            errors={errors.email}
          />

          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            errors={errors.password}
          />

          <Field
            label="Confirm Password"
            name="password_confirm"
            type="password"
            value={form.password_confirm}
            onChange={handleChange}
            errors={errors.password_confirm}
          />

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
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: string[];
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

function Field({
  label,
  name,
  value,
  onChange,
  errors,
  type = "text",
  placeholder,
  autoFocus,
}: FieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required
        autoFocus={autoFocus}
        aria-invalid={!!errors}
        aria-describedby={errors ? errorId : undefined}
      />

      {errors && (
        <div id={errorId} className="error-message">
          {errors.join(" • ")}
        </div>
      )}
    </div>
  );
}