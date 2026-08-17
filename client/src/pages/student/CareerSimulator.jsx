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
      <h1 className="text-2xl font-bold text-slate-800">What-If Career Simulator</h1>
      <p className="text-slate-500 text-sm">Select the areas you plan to improve. We'll calculate exactly how much your employability score would move — the math is deterministic, not guessed.</p>

      <div className="card">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => toggle(c.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                selected.find((i) => i.category === c.key) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
              }`}
            >
              Improve {c.label} (+15)
            </button>
          ))}
        </div>
        <button className="btn-primary mt-4" onClick={simulate} disabled={loading}>{loading ? "Simulating…" : "Run Simulation"}</button>
      </div>

      {result && (
        <div className="card space-y-4">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <ScoreRing score={result.currentScore} size={120} label="Current" />
            </div>
            <div className="text-3xl text-slate-300">→</div>
            <div className="text-center">
              <ScoreRing score={result.simulatedScore} size={120} label="Simulated" />
            </div>
          </div>
          <p className="text-center text-lg font-semibold text-green-600">
            Potential Improvement: +{result.scoreDifference}%
          </p>
          <p className="text-sm text-slate-600 border-t border-slate-100 pt-3">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
