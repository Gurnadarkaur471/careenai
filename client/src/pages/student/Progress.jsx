import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../services/api";
import { TrendingUp, Award, Code, Brain, FileCheck, MessageSquare } from "lucide-react";

export default function ProgressPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/progress").then((res) => {
      const data = (res.data.data.history || []).map((h) => ({
        date: new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        Employability: h.employabilityScore,
        Technical: h.technicalScore,
        Aptitude: h.aptitudeScore,
        Resume: h.resumeScore,
        Communication: h.communicationScore,
        Interview: h.interviewScore,
      }));
      setHistory(data);
    });
  }, []);

  const latest = history[history.length - 1] || null;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Continuous Growth</p>
        </div>
        <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Growth & Progress Trajectory</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Historical growth tracking across core technical competencies, interview performance, and market readiness.
        </p>
      </div>

      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="card p-4 border border-brand-200/80 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/40">
            <span className="text-[11px] font-bold uppercase text-brand-700 dark:text-brand-300">Employability</span>
            <p className="mt-1 text-2xl font-black text-brand-600 dark:text-brand-400">{latest.Employability}%</p>
          </div>
          <div className="card p-4 border border-sky-200/80 dark:border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/40">
            <span className="text-[11px] font-bold uppercase text-sky-700 dark:text-sky-300">Technical</span>
            <p className="mt-1 text-2xl font-black text-sky-600 dark:text-sky-400">{latest.Technical}%</p>
          </div>
          <div className="card p-4 border border-emerald-200/80 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/40">
            <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Aptitude</span>
            <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{latest.Aptitude}%</p>
          </div>
          <div className="card p-4 border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/40">
            <span className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-300">Resume</span>
            <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{latest.Resume}%</p>
          </div>
          <div className="card p-4 border border-pink-200/80 dark:border-pink-500/30 bg-pink-50/50 dark:bg-pink-950/40">
            <span className="text-[11px] font-bold uppercase text-pink-700 dark:text-pink-300">Communication</span>
            <p className="mt-1 text-2xl font-black text-pink-600 dark:text-pink-400">{latest.Communication}%</p>
          </div>
          <div className="card p-4 border border-purple-200/80 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/40">
            <span className="text-[11px] font-bold uppercase text-purple-700 dark:text-purple-300">Interview</span>
            <p className="mt-1 text-2xl font-black text-purple-600 dark:text-purple-400">{latest.Interview}%</p>
          </div>
        </div>
      )}

      <div className="card p-6 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl" style={{ height: 420 }}>
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <TrendingUp size={36} className="text-slate-400 mb-2" />
            <p className="text-slate-700 dark:text-slate-300 font-bold">No progress history recorded yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Complete practice assessments, run resume diagnostics, or take a mock interview to start populating your trajectory.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
              <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" tickLine={false} />
              <YAxis domain={[0, 100]} fontSize={11} stroke="#94a3b8" tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Line type="monotone" dataKey="Employability" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Technical" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Aptitude" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Resume" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Communication" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Interview" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
