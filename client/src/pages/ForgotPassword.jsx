import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/Toast.jsx";

export default function ForgotPassword() {
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      push("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-slate-800">Reset Your Password</h1>
        {sent ? (
          <p className="text-center text-slate-500 mt-6 text-sm">If that email exists, a reset link has been sent. Check your inbox.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="btn-primary w-full" disabled={loading}>{loading ? "Sending…" : "Send Reset Link"}</button>
          </form>
        )}
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/login" className="text-brand-600 font-medium">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
