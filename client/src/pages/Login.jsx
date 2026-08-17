import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      push("Welcome back!");
      navigate(user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      push(err.response?.data?.message || "Login failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-slate-800">Welcome Back 👋</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" {...register("email", { required: true })} />
            {errors.email && <p className="text-xs text-red-500 mt-1">Email is required</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" {...register("password", { required: true })} />
            {errors.password && <p className="text-xs text-red-500 mt-1">Password is required</p>}
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Logging in…" : "Login"}</button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account? <Link to="/signup" className="text-brand-600 font-medium">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
