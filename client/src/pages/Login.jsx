import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      push("Welcome back!");
      if (user.role === "ADMIN") navigate("/admin/dashboard");
      else if (location.state?.practice) navigate("/interview-coach", { state: { practice: location.state.practice } });
      else navigate("/dashboard");
    } catch (err) {
      push(err.response?.data?.message || "Login failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-4xl p-0 overflow-hidden grid md:grid-cols-2 shadow-2xl border border-white/60 dark:border-white/10 backdrop-blur-2xl">
        <div className="relative hidden md:block bg-slate-950">
          <img
            src="/images/career-coaching.jpg"
            alt="PrepWise Platform"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-8 text-white">
            <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">PrepWise Intelligence</span>
            <h2 className="text-2xl font-bold">Your Career Journey, Supercharged by AI.</h2>
            <p className="text-xs text-slate-300 mt-2">
              Continuous mock interviews, ATS resume diagnostics, and deterministic career simulation.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10 flex flex-col justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 self-start rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-300 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 mb-4 group backdrop-blur-md active:scale-95"
          >
            <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1 text-brand-600 dark:text-brand-400" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-900/10 dark:ring-white/10 p-0.5">
              <img src="/images/prepwise-icon.png" alt="PrepWise" className="h-full w-full object-contain dark:hidden" />
              <img src="/images/prepwise-icon-dark.png" alt="PrepWise" className="h-full w-full object-contain hidden dark:block" />
            </div>
            <span className="text-lg font-black tracking-tight">
              <span className="text-slate-900 dark:text-white">Prep</span>
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">Wise</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your PrepWise employability workspace.</p>
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
            <button className="btn-primary w-full shadow-lg shadow-brand-500/20" disabled={loading}>{loading ? "Logging in…" : "Login"}</button>
          </form>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account? <Link to="/signup" state={location.state} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
