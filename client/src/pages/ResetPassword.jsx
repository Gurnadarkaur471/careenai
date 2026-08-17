import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/Toast.jsx";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      push("Password updated. Please log in.");
      navigate("/login");
    } catch (err) {
      push(err.response?.data?.message || "Reset failed. The link may have expired.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-slate-800">Set a New Password</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Updating…" : "Update Password"}</button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/login" className="text-brand-600 font-medium">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
