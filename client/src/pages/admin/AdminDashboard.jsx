import React, { useCallback, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../../components/StatCard.jsx";
import { Users, TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import api from "../../services/api";
import Students from "./Students.jsx";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(() => {
    setError("");
    api.get("/admin/dashboard")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load dashboard data."));
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (!data) {
    return (
      <div className="card text-center py-12 text-slate-500 dark:text-slate-400">
        {error ? (
          <div role="alert" className="space-y-3">
            <p className="text-rose-600 dark:text-rose-400">{error}</p>
            <button className="btn-secondary" onClick={loadDashboard}>Retry</button>
          </div>
        ) : (
          <>
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-r-transparent mr-2 align-middle" />
            Loading dashboard…
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Platform Overview</p>
        </div>
        <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={data.totalStudents} color="indigo" />
        <StatCard icon={TrendingUp} label="Avg Employability" value={`${data.avgEmployability}%`} color="cyan" />
        <StatCard icon={CheckCircle2} label="Placement Ready" value={data.readyForPlacement} sub="Score ≥ 75%" color="emerald" />
        <StatCard icon={AlertTriangle} label="Needs Attention" value={data.needsImprovement} sub="Score < 50%" color="rose" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-brand-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Top Skill Gaps (All Students)</h3>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topSkillGaps}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                <XAxis dataKey="skill" fontSize={11} stroke="#94a3b8" tickLine={false} />
                <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                    backdropFilter: "blur(10px)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">Branch-Wise Readiness</h3>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.branchWiseReadiness}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                <XAxis dataKey="branch" fontSize={11} stroke="#94a3b8" tickLine={false} />
                <YAxis domain={[0, 100]} fontSize={11} stroke="#94a3b8" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                    backdropFilter: "blur(10px)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="avgScore" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Avg Technical" value={`${data.avgTechnical}%`} color="sky" />
        <StatCard label="Avg Resume" value={`${data.avgResume}%`} color="amber" />
        <StatCard label="Avg Interview" value={`${data.avgInterview}%`} color="purple" />
      </div>

      <Students />
    </div>
  );
}
