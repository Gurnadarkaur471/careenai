import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";

export default function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signup } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup(data);
      push("Account created! Welcome to CareerAI.");
      if (location.state?.practice) navigate("/interview-coach", { state: { practice: location.state.practice } });
      else navigate("/dashboard");
    } catch (err) {
      push(err.response?.data?.message || "Signup failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-4xl p-0 overflow-hidden grid md:grid-cols-2 shadow-2xl border border-white/60 dark:border-white/10 backdrop-blur-2xl">
        <div className="relative hidden md:block bg-slate-950">
          <img
            src="/images/career-simulation.jpg"
            alt="AI Career Acceleration"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-8 text-white">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Employability Engine</span>
            <h2 className="text-2xl font-bold">Start Your Personalized AI Growth Trajectory</h2>
            <p className="text-xs text-slate-300 mt-2">
              Discover skill gaps, benchmark against real market demands, and get placement-ready.
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

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Your Account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Join CareerAI and unlock your full career potential.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" {...register("name", { required: true })} />
              {errors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" {...register("email", { required: true })} />
              {errors.email && <p className="text-xs text-red-500 mt-1">Email is required</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" {...register("password", { required: true, minLength: 6 })} />
              {errors.password && <p className="text-xs text-red-500 mt-1">Minimum 6 characters</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">College</label>
                <input className="input" {...register("college")} />
              </div>
              <div>
                <label className="label">Branch</label>
                <input className="input" {...register("branch")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Target Role</label>
                <select className="input" defaultValue="Software Developer" {...register("targetRole")}>
                  <option>Software Developer</option>
                  <option>Data Analyst</option>
                  <option>ML Engineer</option>
                  <option>Product Manager</option>
                  <option>UX Designer</option>
                </select>
              </div>
              <div>
                <label className="label">Target Goal</label>
                <select className="input" defaultValue="Land my first job" {...register("targetGoal")}>
                  <option>Land my first job</option>
                  <option>Prepare for an internship</option>
                  <option>Switch careers</option>
                  <option>Get promoted</option>
                  <option>Build job-ready skills</option>
                </select>
              </div>
            </div>
            <button className="btn-primary w-full shadow-lg shadow-brand-500/20" disabled={loading}>{loading ? "Creating account…" : "Sign Up"}</button>
          </form>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account? <Link to="/login" state={location.state} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
