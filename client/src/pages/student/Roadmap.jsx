import React, { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";

export default function Roadmap() {
  const { push } = useToast();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.get("/career/roadmap");
      setRoadmap(res.data.data.roadmap);
    } catch (err) {
      push(err.response?.data?.message || "Generate your skill gaps first.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Career Roadmap</h1>
        <button className="btn-primary" onClick={generate} disabled={loading}>{loading ? "Generating…" : "Generate Roadmap"}</button>
      </div>
      {roadmap?.weeks?.map((w) => (
        <div key={w.week} className="card">
          <p className="font-semibold text-slate-800">Week {w.week}: {w.focus}</p>
          <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
            {w.tasks.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      ))}
      {!roadmap && <p className="text-slate-400 text-sm">Generate a personalized week-by-week roadmap based on your skill gaps.</p>}
    </div>
  );
}
