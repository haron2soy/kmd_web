import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post("/auth/register/", {
        username: form.username,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
      });

      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Registration failed. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 px-4 py-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 border">
        <h1 className="text-2xl font-bold mb-2">Create account</h1>
        <p className="text-gray-600 mb-6">
          Register to access the system
        </p>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="first_name"
              placeholder="First name"
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              name="last_name"
              placeholder="Last name"
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg"
            />
          </div>

          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}