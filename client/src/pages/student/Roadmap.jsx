import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import { Calendar, Compass, Trophy, CheckCircle2, Circle, Sparkles, MapPin } from "lucide-react";

export default function Roadmap() {
  const { push } = useToast();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [completedTasks, setCompletedTasks] = useState({});

  const weeks = roadmap?.weeks || [];

  const activeWeek = useMemo(
    () => weeks.find((w) => w.week === selectedWeek) || weeks[0] || null,
    [weeks, selectedWeek]
  );

  const chartData = useMemo(
    () =>
      weeks.map((week, index) => ({
        week: `W${week.week}`,
        focus: week.focus,
        momentum: Math.min(100, 45 + index * 12 + week.tasks.length * 8),
      })),
    [weeks]
  );

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progress = weeks.length ? Math.round((completedCount / weeks.length) * 100) : 0;

  const toggleTask = (weekNumber, taskIndex) => {
    const key = `${weekNumber}-${taskIndex}`;
    setCompletedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.get("/career/roadmap");
      const data = res.data.data.roadmap;
      setRoadmap(data);
      setSelectedWeek(data?.weeks?.[0]?.week || 1);
      setCompletedTasks({});
      push("Personalized career roadmap ready!");
    } catch (err) {
      push(err.response?.data?.message || "Generate your skill gaps first.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Structured Milestone Plan</p>
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Career Learning Roadmap</h1>
        </div>
        <button
          className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
          onClick={generate}
          disabled={loading}
        >
          <Sparkles size={16} />
          <span>{loading ? "Generating Roadmap…" : "Generate Roadmap"}</span>
        </button>
      </div>

      {!roadmap && (
        <div className="card border-dashed border-2 border-slate-300 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 text-center py-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-400 mb-3 shadow-md">
            <Compass size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Active Roadmap Generated</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mt-1">
            Generate an AI-powered week-by-week learning blueprint tailored to your current competency gaps and target career role.
          </p>
          <button className="btn-primary mt-5 inline-flex items-center gap-2" onClick={generate} disabled={loading}>
            <Sparkles size={16} /> Launch Roadmap Generator
          </button>
        </div>
      )}

      {roadmap && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Duration</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Calendar size={18} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{weeks.length} <span className="text-sm font-semibold text-slate-500">Weeks</span></p>
            </div>

            <div className="card p-5 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Focus Areas</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                  <Compass size={18} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{new Set(weeks.map((w) => w.focus)).size} <span className="text-sm font-semibold text-slate-500">Disciplines</span></p>
            </div>

            <div className="card p-5 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Overall Progress</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Trophy size={18} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                {progress}%
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="card p-5 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-base">Milestone Progress</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Task completion percentage</p>
                </div>
                <span className="rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-500/30 px-3 py-1 text-xs font-bold text-brand-700 dark:text-brand-300">
                  {completedCount}/{weeks.length} milestones
                </span>
              </div>
              <div className="h-3.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-cyan-500 transition-all duration-500 shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="card p-5 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-bold text-slate-900 dark:text-white text-base">Weekly Momentum</p>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target intensity</span>
              </div>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
                      contentStyle={{
                        borderRadius: 12,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <Bar dataKey="momentum" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === selectedWeek - 1 ? "#6366f1" : index % 2 === 0 ? "#10b981" : "#06b6d4"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.5fr]">
            <div className="space-y-3">
              {weeks.map((w) => {
                const isSelected = selectedWeek === w.week;
                return (
                  <button
                    key={w.week}
                    type="button"
                    onClick={() => setSelectedWeek(w.week)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-brand-500/80 bg-brand-50/80 dark:bg-brand-950/50 shadow-lg shadow-brand-500/10 ring-2 ring-brand-400/30"
                        : "border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600 dark:text-brand-400">Week {w.week}</p>
                        <p className="mt-1 font-bold text-slate-900 dark:text-white text-base">{w.focus}</p>
                      </div>
                      <span className="rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {w.tasks.length} tasks
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {activeWeek && (
              <div className="card p-6 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl">
                <div className="mb-5 flex items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-white/10">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                      <MapPin size={14} /> Active Milestone
                    </div>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                      Week {activeWeek.week}: {activeWeek.focus}
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Week {activeWeek.week} Focus
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action Items & Deliverables</p>
                  <ul className="space-y-2.5">
                    {activeWeek.tasks.map((task, index) => {
                      const key = `${activeWeek.week}-${index}`;
                      const isDone = !!completedTasks[key];

                      return (
                        <li
                          key={index}
                          onClick={() => toggleTask(activeWeek.week, index)}
                          className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer ${
                            isDone
                              ? "border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200"
                              : "border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <button
                            type="button"
                            className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                            aria-label={`Mark task: ${task}`}
                          >
                            {isDone ? (
                              <CheckCircle2 size={18} className="fill-emerald-500 text-white dark:text-slate-950" />
                            ) : (
                              <Circle size={18} className="text-slate-400 dark:text-slate-500 hover:text-brand-500" />
                            )}
                          </button>
                          <span className={`flex-1 text-sm leading-relaxed ${isDone ? "text-slate-500 dark:text-slate-400 line-through" : "text-slate-800 dark:text-slate-100 font-medium"}`}>
                            {task}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
