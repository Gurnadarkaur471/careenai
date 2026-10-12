import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";

const STATUS_STYLE = {
  strong: "bg-green-50 text-green-700 border-green-200",
  "needs-improvement": "bg-amber-50 text-amber-700 border-amber-200",
  missing: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_META = {
  strong: { label: "Strong", accent: "#16a34a" },
  "needs-improvement": { label: "Needs improvement", accent: "#f59e0b" },
  missing: { label: "Missing", accent: "#ef4444" },
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
    const res = await api.get("/skills/gaps");
    setGaps(res.data.data.skillGaps);
    setSelectedSkill(res.data.data.skillGaps[0]?._id || null);
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/skills/gaps");
      setGaps(res.data.data.skillGaps);
      setExplanation(res.data.data.aiExplanation);
      setSelectedSkill(res.data.data.skillGaps[0]?._id || null);
      push("Skill gaps updated.");
    } catch (err) {
      push(err.response?.data?.message || "Could not generate skill gaps.", "error");
    } finally {
      setLoading(false);
    }
  };

  const grouped = { strong: [], "needs-improvement": [], missing: [] };
  gaps.forEach((g) => grouped[g.status]?.push(g));

  const visibleSkills = grouped[activeStatus];
  const selectedGap = gaps.find((item) => item._id === selectedSkill) || visibleSkills[0] || null;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Skill health</p>
          <h1 className="text-2xl font-bold text-slate-800">Skill Gap Analysis</h1>
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading}>{loading ? "Analyzing…" : "Refresh Analysis"}</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="card overflow-hidden p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Current readiness</p>
              <h2 className="text-xl font-bold text-slate-800">Skill balance map</h2>
            </div>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">AI insight</span>
          </div>

          <svg viewBox="0 0 280 220" className="h-52 w-full overflow-visible">
            {[60, 90, 120, 150].map((radius) => (
              <circle key={radius} cx="140" cy="110" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="4 6" />
            ))}

            <g>
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                const x = 140 + Math.cos(angle) * 150;
                const y = 110 + Math.sin(angle) * 150;
                return <line key={i} x1="140" y1="110" x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
              })}
            </g>

            <g>
              {visualData.map((item, index) => (
                <g key={item._id || index}>
                  <line x1="140" y1="110" x2={item.x} y2={item.y} stroke={STATUS_META[item.status].accent} strokeOpacity="0.45" strokeWidth="2" />
                  <circle cx={item.x} cy={item.y} r="6" fill={STATUS_META[item.status].accent} stroke="#fff" strokeWidth="2" />
                  <text x={item.x} y={item.y - 12} textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="600">{item.skill.slice(0, 5)}</text>
                </g>
              ))}
            </g>

            <circle cx="140" cy="110" r="16" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="2" />
            <text x="140" y="116" textAnchor="middle" fill="#4f46e5" fontSize="16" fontWeight="700">{gaps.length || 0}</text>
          </svg>
        </div>

        <div className="space-y-3">
          {Object.entries(STATUS_META).map(([status, meta]) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                activeStatus === status
                  ? "border-slate-300 bg-slate-50 shadow-sm"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ background: meta.accent }} />
                <span className="font-medium text-slate-700">{meta.label}</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{summary[status]}</span>
            </button>
          ))}
        </div>
      </div>

      {explanation && <div className="card text-sm leading-6 text-slate-600">{explanation}</div>}

      {selectedGap && (
        <div className="card border border-brand-100 bg-gradient-to-r from-brand-50 to-cyan-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Selected skill</p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{selectedGap.skill}</h3>
              <p className="text-sm text-slate-600">{selectedGap.reason}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_STYLE[selectedGap.status]}`}>
                {STATUS_META[selectedGap.status].label}
              </span>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600">{selectedGap.priority}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>Current level</span>
              <span>{selectedGap.currentLevel}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500"
                style={{ width: `${Math.min(selectedGap.currentLevel || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {Object.keys(STATUS_META).map((status) => (
        <div key={status} className="space-y-2">
          {activeStatus === status && (
            <>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{STATUS_META[status].label}</h3>
              {visibleSkills.length === 0 && <p className="text-sm text-slate-400">None</p>}
              {visibleSkills.map((g) => {
                const isSelected = selectedSkill === g._id;
                return (
                  <button
                    type="button"
                    key={g._id}
                    onClick={() => setSelectedSkill(g._id)}
                    className={`card w-full border text-left transition ${STATUS_STYLE[status]} ${
                      isSelected ? "ring-2 ring-brand-200 shadow-md" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{g.skill}</p>
                        <p className="text-xs opacity-70 mt-0.5">{g.recommendation}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white/60 px-2 py-1 text-xs font-semibold">{g.priority}</span>
                        <span className="text-xs font-semibold text-slate-700">{g.currentLevel}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
