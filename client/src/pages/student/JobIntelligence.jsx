import React, { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import { Briefcase, Building2, FileText, CheckCircle2, XCircle, Sparkles, Target, Zap } from "lucide-react";

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
      push("Job requirements analyzed successfully!");
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
      push("Match calculation complete!");
    } catch (err) {
      push(err.response?.data?.message || "Matching failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Market Intelligence</p>
        </div>
        <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Job Intelligence & Role Fit</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Analyze job postings to extract critical skills, keyword expectations, and benchmark your readiness.
        </p>
      </div>

      <div className="card space-y-4 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText size={18} className="text-brand-500" /> Job Specification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <input
              className="input pl-10"
              placeholder="e.g. Senior Frontend Engineer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Briefcase size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          </div>
          <div className="relative">
            <input
              className="input pl-10"
              placeholder="e.g. Stripe, Google, or Stealth Startup"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <Building2 size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          </div>
        </div>
        <textarea
          className="input"
          rows={6}
          placeholder="Paste the full job description or requirements section here…"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button
          className="btn-primary w-full md:w-auto inline-flex items-center justify-center gap-2"
          onClick={analyze}
          disabled={loading}
        >
          <Sparkles size={16} />
          <span>{loading ? "Extracting Requirements…" : "Analyze Job Requirements"}</span>
        </button>
      </div>

      {job && (
        <div className="card space-y-5 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-white/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Target Role Extracted</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {job.title} {job.company && <span className="text-slate-500 font-semibold">• {job.company}</span>}
              </h3>
            </div>
            <button
              className="btn-primary inline-flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-brand-500/25"
              onClick={runMatch}
              disabled={loading}
            >
              <Target size={16} />
              <span>{loading ? "Calculating Match…" : "Match My Profile"}</span>
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Must-Have Core Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-500/30 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-bold shadow-sm"
                >
                  ✓ {s}
                </span>
              ))}
              {job.requiredSkills.length === 0 && <span className="text-xs text-slate-400">None detected</span>}
            </div>
          </div>

          {job.preferredSkills?.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Preferred & Bonus Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {match && (
        <div className="card space-y-6 border border-brand-200/80 dark:border-brand-500/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Match Compatibility Analysis</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Role Readiness Score</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white font-black text-xl shadow-lg shadow-brand-500/30">
                {match.jobMatch.matchScore}%
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Matched Skills ({match.jobMatch.matchedSkills.length})
              </p>
              <ul className="text-sm text-slate-800 dark:text-slate-200 space-y-1.5">
                {match.jobMatch.matchedSkills.map((s) => (
                  <li key={s} className="flex items-center gap-2 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {s}
                  </li>
                ))}
                {match.jobMatch.matchedSkills.length === 0 && <li className="text-slate-400 text-xs">No overlapping skills detected yet.</li>}
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-200/80 dark:border-rose-800/40 bg-rose-50/50 dark:bg-rose-950/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-1.5">
                <XCircle size={16} /> Missing Skills ({match.jobMatch.missingSkills.length})
              </p>
              <ul className="text-sm text-slate-800 dark:text-slate-200 space-y-1.5">
                {match.jobMatch.missingSkills.map((s) => (
                  <li key={s} className="flex items-center gap-2 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> {s}
                  </li>
                ))}
                {match.jobMatch.missingSkills.length === 0 && <li className="text-slate-400 text-xs">All requirements matched!</li>}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-brand-100 dark:border-white/10 bg-brand-50/40 dark:bg-slate-800/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1 flex items-center gap-1.5">
              <Zap size={14} /> AI Recommendation Insight
            </p>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{match.jobMatch.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
