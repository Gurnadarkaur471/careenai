import React, { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";

export default function JobIntelligence() {
  const { push } = useToast();
  const [form, setForm] = useState({ title: "", company: "", description: "" });
  const [job, setJob] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (form.description.trim().length < 30) return push("Paste a fuller job description (30+ characters).", "error");
    setLoading(true);
    try {
      const res = await api.post("/jobs/analyze", form);
      setJob(res.data.data.job);
      setMatch(null);
    } catch (err) {
      push(err.response?.data?.message || "Analysis failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const runMatch = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/jobs/${job._id}/match`);
      setMatch(res.data.data);
      push("Match calculated.");
    } catch (err) {
      push(err.response?.data?.message || "Matching failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Job Intelligence</h1>

      <div className="card space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Job Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="input" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        </div>
        <textarea className="input" rows={8} placeholder="Paste the full job description here…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn-primary" onClick={analyze} disabled={loading}>{loading ? "Analyzing…" : "Analyze Job Description"}</button>
      </div>

      {job && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-slate-800">{job.title} {job.company && `— ${job.company}`}</h3>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((s) => <span key={s} className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">{s}</span>)}
              {job.requiredSkills.length === 0 && <span className="text-xs text-slate-400">None detected</span>}
            </div>
          </div>
          {job.preferredSkills?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Preferred Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((s) => <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{s}</span>)}
              </div>
            </div>
          )}
          <button className="btn-primary" onClick={runMatch} disabled={loading}>{loading ? "Matching…" : "Match Me Against This Job"}</button>
        </div>
      )}

      {match && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-slate-800">Match Result: {match.jobMatch.matchScore}%</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Matched Skills</p>
              <ul className="text-sm text-slate-600 space-y-1">
                {match.jobMatch.matchedSkills.map((s) => <li key={s}>✓ {s}</li>)}
                {match.jobMatch.matchedSkills.length === 0 && <li className="text-slate-400">None</li>}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Missing Skills</p>
              <ul className="text-sm text-slate-600 space-y-1">
                {match.jobMatch.missingSkills.map((s) => <li key={s}>✗ {s}</li>)}
                {match.jobMatch.missingSkills.length === 0 && <li className="text-slate-400">None</li>}
              </ul>
            </div>
          </div>
          <p className="text-sm text-slate-500 border-t border-slate-100 pt-3">{match.jobMatch.explanation}</p>
        </div>
      )}
    </div>
  );
}
