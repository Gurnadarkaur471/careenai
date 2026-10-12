import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-10">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-slate-800">Create Your Account</h1>
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
          <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating account…" : "Sign Up"}</button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account? <Link to="/login" state={location.state} className="text-brand-600 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}
