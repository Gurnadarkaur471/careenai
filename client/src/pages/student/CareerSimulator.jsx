import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import ScoreRing from "../../components/ScoreRing.jsx";

const CATEGORIES = [
  { key: "technical", label: "Technical Skills" },
  { key: "aptitude", label: "Aptitude" },
  { key: "resume", label: "Resume" },
  { key: "communication", label: "Communication" },
  { key: "interview", label: "Interview" },
];

export default function CareerSimulator() {
  const { push } = useToast();
  const [current, setCurrent] = useState(null);
  const [selected, setSelected] = useState([]); // [{category, delta}]
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/students/dashboard").then((res) => setCurrent(res.data.data.componentScores));
  }, []);

  const toggle = (category) => {
    setSelected((s) =>
      s.find((i) => i.category === category) ? s.filter((i) => i.category !== category) : [...s, { category, delta: 15 }]
    );
  };

  const simulate = async () => {
    if (!selected.length) return push("Select at least one improvement.", "error");
    setLoading(true);
    try {
      const res = await api.post("/career/simulate", { improvements: selected });
      setResult(res.data.data.simulation);
      push("Simulation complete.");
    } catch (err) {
      push(err.response?.data?.message || "Simulation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!current) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-950 group">
        <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden">
          <img
            src="/images/career-simulation.jpg"
            alt="AI Career Trajectory Simulation"
            className="w-full h-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent flex items-center p-6">
            <div className="max-w-md text-white">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 mb-2">
                Deterministic Growth Engine
              </span>
              <h2 className="text-xl md:text-2xl font-bold">Predict Your Career Growth</h2>
              <p className="text-xs md:text-sm text-slate-300 mt-1">
                Simulate skill improvements to see how your employability score, salary growth, and role readiness will advance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">What-If Career Simulator</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select the areas you plan to improve. We'll calculate exactly how much your employability score would move — the math is deterministic, not guessed.</p>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => toggle(c.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                selected.find((i) => i.category === c.key)
                  ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-brand-500 shadow-md shadow-brand-500/25"
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-white/10 hover:border-brand-400 dark:hover:border-brand-400 hover:bg-white dark:hover:bg-slate-700"
              }`}
            >
              +15% {c.label}
            </button>
          ))}
        </div>
        <button className="btn-primary mt-5" onClick={simulate} disabled={loading}>{loading ? "Simulating…" : "Run Simulation"}</button>
      </div>

      {result && (
        <div className="card space-y-4">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <ScoreRing score={result.currentScore} size={120} label="Current" />
            </div>
            <div className="text-3xl font-light text-slate-400 dark:text-slate-500">→</div>
            <div className="text-center">
              <ScoreRing score={result.simulatedScore} size={120} label="Simulated" />
            </div>
          </div>
          <p className="text-center text-lg font-bold text-emerald-600 dark:text-emerald-400">
            Potential Improvement: +{result.scoreDifference}%
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-white/10 pt-3">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
