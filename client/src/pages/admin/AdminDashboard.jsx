import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../../components/StatCard.jsx";
import { Users, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import api from "../../services/api";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setData(res.data.data));
  }, []);

  if (!data) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={data.totalStudents} />
        <StatCard icon={TrendingUp} label="Avg Employability" value={`${data.avgEmployability}%`} />
        <StatCard icon={CheckCircle2} label="Ready for Placement" value={data.readyForPlacement} sub="Score ≥ 75%" />
        <StatCard icon={AlertTriangle} label="Needs Improvement" value={data.needsImprovement} sub="Score < 50%" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Top Skill Gaps (All Students)</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topSkillGaps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="skill" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Branch-Wise Readiness</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.branchWiseReadiness}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="branch" fontSize={11} />
                <YAxis domain={[0, 100]} fontSize={11} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Avg Technical" value={`${data.avgTechnical}%`} />
        <StatCard label="Avg Communication" value={`${data.avgCommunication}%`} />
        <StatCard label="Avg Interview" value={`${data.avgInterview}%`} />
      </div>
    </div>
  );
}
