import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";

const STATUS_STYLE = {
  strong: "bg-green-50 text-green-700 border-green-200",
  "needs-improvement": "bg-amber-50 text-amber-700 border-amber-200",
  missing: "bg-red-50 text-red-700 border-red-200",
};

export default function SkillGapPage() {
  const { push } = useToast();
  const [gaps, setGaps] = useState([]);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await api.get("/skills/gaps");
    setGaps(res.data.data.skillGaps);
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/skills/gaps");
      setGaps(res.data.data.skillGaps);
      setExplanation(res.data.data.aiExplanation);
      push("Skill gaps updated.");
    } catch (err) {
      push(err.response?.data?.message || "Could not generate skill gaps.", "error");
    } finally {
      setLoading(false);
    }
  };

  const grouped = { strong: [], "needs-improvement": [], missing: [] };
  gaps.forEach((g) => grouped[g.status]?.push(g));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Skill Gap Analysis</h1>
        <button className="btn-primary" onClick={generate} disabled={loading}>{loading ? "Analyzing…" : "Refresh Analysis"}</button>
      </div>

      {explanation && <div className="card text-sm text-slate-600">{explanation}</div>}

      {["missing", "needs-improvement", "strong"].map((status) => (
        <div key={status} className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{status.replace("-", " ")}</h3>
          {grouped[status].length === 0 && <p className="text-sm text-slate-400">None</p>}
          {grouped[status].map((g) => (
            <div key={g._id} className={`card border ${STATUS_STYLE[status]} flex items-center justify-between`}>
              <div>
                <p className="font-medium">{g.skill}</p>
                <p className="text-xs opacity-70 mt-0.5">{g.recommendation}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/60">{g.priority}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
