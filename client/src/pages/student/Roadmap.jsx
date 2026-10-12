import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";

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
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-700">Learning plan</p>
          <h1 className="text-2xl font-bold text-slate-800">Career Roadmap</h1>
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading}>{loading ? "Generating…" : "Generate Roadmap"}</button>
      </div>

      {!roadmap && (
        <div className="card border-dashed border-2 border-slate-200 bg-slate-50/60">
          <p className="text-slate-500 text-sm">Generate a personalized week-by-week roadmap based on your skill gaps.</p>
        </div>
      )}

      {roadmap && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card">
              <p className="text-sm text-slate-500">Weeks</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">{weeks.length}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">Focus areas</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">{new Set(weeks.map((w) => w.focus)).size}</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-500">Progress</p>
              <p className="mt-2 text-3xl font-bold text-brand-700">{progress}%</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-slate-800">Milestone progress</p>
                <span className="text-xs font-medium text-slate-500">{completedCount}/{weeks.length} weeks tracked</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="card p-4">
              <p className="mb-3 font-semibold text-slate-800">Weekly momentum</p>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(79, 70, 229, 0.08)" }}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 20px rgba(15,23,42,0.08)" }}
                    />
                    <Bar dataKey="momentum" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === selectedWeek - 1 ? "#4f46e5" : index % 2 === 0 ? "#22c55e" : "#38bdf8"}
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
              {weeks.map((w) => (
                <button
                  key={w.week}
                  type="button"
                  onClick={() => setSelectedWeek(w.week)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    selectedWeek === w.week
                      ? "border-brand-500 bg-brand-50/70 shadow-lg shadow-brand-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Week {w.week}</p>
                      <p className="mt-2 font-semibold text-slate-800">{w.focus}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {w.tasks.length} tasks
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {activeWeek && (
              <div className="card p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Current focus</p>
                    <h2 className="mt-2 text-xl font-bold text-slate-800">Week {activeWeek.week}: {activeWeek.focus}</h2>
                  </div>
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                    Active milestone
                  </span>
                </div>

                <ul className="space-y-3">
                  {activeWeek.tasks.map((task, index) => {
                    const key = `${activeWeek.week}-${index}`;
                    const isDone = !!completedTasks[key];

                    return (
                      <li
                        key={index}
                        className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                          isDone ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50/60"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleTask(activeWeek.week, index)}
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                            isDone
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-300 bg-white text-slate-400"
                          }`}
                          aria-label={`Mark task as complete: ${task}`}
                        >
                          {isDone ? "✓" : ""}
                        </button>
                        <span className={`flex-1 text-sm ${isDone ? "text-slate-500 line-through" : "text-slate-700"}`}>
                          {task}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
