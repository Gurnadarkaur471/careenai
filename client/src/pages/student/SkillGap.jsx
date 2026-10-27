import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import { Sparkles, Target, Award, AlertCircle, RefreshCw } from "lucide-react";

const STATUS_STYLE = {
  strong: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50",
  "needs-improvement": "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
  missing: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50",
};

const STATUS_META = {
  strong: { label: "Strong", accent: "#10b981", icon: Award },
  "needs-improvement": { label: "Needs improvement", accent: "#f59e0b", icon: Target },
  missing: { label: "Missing", accent: "#f43f5e", icon: AlertCircle },
};

export default function SkillGapPage() {
  const { push } = useToast();
  const [gaps, setGaps] = useState([]);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState("needs-improvement");
  const [selectedSkill, setSelectedSkill] = useState(null);

  const summary = useMemo(() => {
    const base = { strong: 0, "needs-improvement": 0, missing: 0 };
    gaps.forEach((g) => {
      if (base[g.status] !== undefined) base[g.status] += 1;
    });
    return base;
  }, [gaps]);

  const visualData = useMemo(() => {
    return gaps.slice(0, 6).map((g, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(gaps.slice(0, 6).length, 1);
      const radius = 72 + (g.currentLevel / 100) * 52;
      return {
        ...g,
        angle,
        radius,
        x: 140 + Math.cos(angle - Math.PI / 2) * radius,
        y: 120 + Math.sin(angle - Math.PI / 2) * radius,
      };
    });
  }, [gaps]);

  const load = async () => {
    try {
      const res = await api.get("/skills/gaps");
      setGaps(res.data.data.skillGaps || []);
      setSelectedSkill(res.data.data.skillGaps?.[0]?._id || null);
    } catch {
      // initial load silent
    }
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/skills/gaps");
      setGaps(res.data.data.skillGaps);
      setExplanation(res.data.data.aiExplanation);
      setSelectedSkill(res.data.data.skillGaps[0]?._id || null);
      push("Skill gaps updated successfully.");
    } catch (err) {
      push(err.response?.data?.message || "Could not generate skill gaps.", "error");
    } finally {
      setLoading(false);
    }
  };

  const grouped = { strong: [], "needs-improvement": [], missing: [] };
  gaps.forEach((g) => grouped[g.status]?.push(g));

  const visibleSkills = grouped[activeStatus] || [];
  const selectedGap = gaps.find((item) => item._id === selectedSkill) || visibleSkills[0] || null;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Skill Health & Diagnostics</p>
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Skill Gap Analysis</h1>
        </div>
        <button
          className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
          onClick={generate}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>{loading ? "Analyzing Capabilities…" : "Refresh Analysis"}</span>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="card overflow-hidden p-5 md:p-6 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Readiness</p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Skill Balance Radar</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-500/30 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300 shadow-sm">
              <Sparkles size={13} className="text-brand-500" /> AI Diagnostic
            </span>
          </div>

          <div className="flex justify-center py-2">
            <svg viewBox="0 0 280 230" className="h-56 w-full max-w-sm overflow-visible">
              {[60, 90, 120, 150].map((radius) => (
                <circle
                  key={radius}
                  cx="140"
                  cy="115"
                  r={radius}
                  fill="none"
                  className="stroke-slate-200/80 dark:stroke-slate-800/80"
                  strokeWidth="1.2"
                  strokeDasharray="4 6"
                />
              ))}

              <g>
                {Array.from({ length: 6 }).map((_, i) => {
                  const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                  const x = 140 + Math.cos(angle) * 150;
                  const y = 115 + Math.sin(angle) * 150;
                  return (
                    <line
                      key={i}
                      x1="140"
                      y1="115"
                      x2={x}
                      y2={y}
                      className="stroke-slate-200/80 dark:stroke-slate-800/80"
                      strokeWidth="1"
                    />
                  );
                })}
              </g>

              <g>
                {visualData.map((item, index) => (
                  <g key={item._id || index}>
                    <line
                      x1="140"
                      y1="115"
                      x2={item.x}
                      y2={item.y}
                      stroke={STATUS_META[item.status].accent}
                      strokeOpacity="0.5"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx={item.x}
                      cy={item.y}
                      r="6.5"
                      fill={STATUS_META[item.status].accent}
                      className="stroke-white dark:stroke-slate-900"
                      strokeWidth="2.5"
                    />
                    <text
                      x={item.x}
                      y={item.y - 10}
                      textAnchor="middle"
                      className="fill-slate-800 dark:fill-slate-200 font-bold"
                      fontSize="9.5"
                    >
                      {item.skill.slice(0, 8)}
                    </text>
                  </g>
                ))}
              </g>

              {/* Center Core */}
              <circle
                cx="140"
                cy="115"
                r="18"
                className="fill-brand-50 dark:fill-brand-950/80 stroke-brand-300 dark:stroke-brand-700"
                strokeWidth="2"
              />
              <text
                x="140"
                y="121"
                textAnchor="middle"
                className="fill-brand-600 dark:fill-brand-400 font-black text-sm"
              >
                {gaps.length || 0}
              </text>
            </svg>
          </div>
        </div>

        {/* Status Category Selectors */}
        <div className="space-y-3 flex flex-col justify-center">
          {Object.entries(STATUS_META).map(([status, meta]) => {
            const Icon = meta.icon;
            const isSelected = activeStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setActiveStatus(status)}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-brand-500/60 bg-brand-50/70 dark:bg-brand-950/40 shadow-lg shadow-brand-500/10 dark:shadow-none"
                    : "border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm"
                    style={{ background: `${meta.accent}20`, color: meta.accent }}
                  >
                    <Icon size={18} />
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{meta.label}</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">View identified gap criteria</p>
                  </div>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold"
                  style={{ background: `${meta.accent}15`, color: meta.accent }}
                >
                  {summary[status]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {explanation && (
        <div className="card border border-brand-200/70 dark:border-brand-500/30 bg-gradient-to-r from-brand-50/60 via-purple-50/40 to-cyan-50/50 dark:from-brand-950/30 dark:via-slate-900/60 dark:to-cyan-950/20 text-sm leading-6 text-slate-700 dark:text-slate-200">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-brand-700 dark:text-brand-300 text-xs uppercase tracking-wider">
            <Sparkles size={14} /> AI Recommendation Overview
          </div>
          {explanation}
        </div>
      )}

      {selectedGap && (
        <div className="card border border-brand-200/80 dark:border-brand-500/30 bg-gradient-to-r from-brand-50/80 via-indigo-50/50 to-cyan-50/80 dark:from-brand-950/50 dark:via-slate-900/80 dark:to-cyan-950/30 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">Selected Skill Focus</p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedGap.skill}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{selectedGap.reason}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${STATUS_STYLE[selectedGap.status]}`}>
                {STATUS_META[selectedGap.status].label}
              </span>
              <span className="rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                Priority: {selectedGap.priority}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Current Competency Level</span>
              <span className="font-bold text-slate-900 dark:text-white">{selectedGap.currentLevel}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-cyan-500 shadow-md transition-all duration-500"
                style={{ width: `${Math.min(selectedGap.currentLevel || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {Object.keys(STATUS_META).map((status) => (
        <div key={status} className="space-y-3">
          {activeStatus === status && (
            <>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {STATUS_META[status].label} Skills ({visibleSkills.length})
              </h3>
              {visibleSkills.length === 0 && (
                <div className="card text-center py-6 text-sm text-slate-400 dark:text-slate-500">
                  No skills in this category yet.
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                {visibleSkills.map((g) => {
                  const isSelected = selectedSkill === g._id;
                  return (
                    <button
                      type="button"
                      key={g._id}
                      onClick={() => setSelectedSkill(g._id)}
                      className={`card text-left transition-all duration-200 p-4 border ${STATUS_STYLE[status]} ${
                        isSelected
                          ? "ring-2 ring-brand-400 dark:ring-brand-500 shadow-md shadow-brand-500/10"
                          : "hover:scale-[1.01]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-base">{g.skill}</p>
                          <p className="text-xs opacity-80 mt-1 line-clamp-1">{g.recommendation}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="rounded-full bg-white/70 dark:bg-slate-800/80 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {g.priority}
                          </span>
                          <span className="text-xs font-bold">{g.currentLevel}%</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
