import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import { Bell, CheckCircle2, ToggleLeft, ToggleRight, Settings2 } from "lucide-react";

const LABELS = {
  assessmentResults: { label: "Assessment Results", desc: "Notify when assessment scores are ready" },
  interviewReports: { label: "Interview Reports", desc: "Notify when interview feedback is processed" },
  resumeAnalysis: { label: "Resume Analysis", desc: "Get alerts on resume ATS scan results" },
  careerProgress: { label: "Career Progress", desc: "Weekly progress digest and milestones" },
  careerRecommendations: { label: "Career Recommendations", desc: "AI-generated role and skill recommendations" },
  marketing: { label: "Marketing & Promotions", desc: "Platform updates, offers, and newsletters" },
};

export default function Settings() {
  const { push } = useToast();
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    api.get("/auth/me").then((res) => setPrefs(res.data.data.user.emailPreferences || {}));
  }, []);

  const toggle = (key) => setPrefs({ ...prefs, [key]: !prefs[key] });

  const save = async () => {
    try {
      push("Preferences saved. Wire this to a backend endpoint to persist across sessions.");
    } catch {
      push("Could not save preferences.", "error");
    }
  };

  if (!prefs) {
    return (
      <div className="card text-center py-12 text-slate-500 dark:text-slate-400">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-r-transparent mr-2 align-middle" />
        Loading preferences…
      </div>
    );
  }

  const enabledCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-slate-500 dark:bg-slate-400 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">Preferences</p>
        </div>
        <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Notification Settings</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Control which email notifications CareerAI sends to your inbox.
        </p>
      </div>

      <div className="card p-6 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl space-y-1">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-brand-500" />
            <p className="font-bold text-slate-900 dark:text-white">Email Notifications</p>
          </div>
          <span className="rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-500/30 px-2.5 py-0.5 text-xs font-bold text-brand-700 dark:text-brand-300">
            {enabledCount} active
          </span>
        </div>

        <div className="space-y-3">
          {Object.entries(LABELS).map(([key, { label, desc }]) => {
            const isOn = !!prefs[key];
            return (
              <label
                key={key}
                onClick={() => toggle(key)}
                className={`flex items-center justify-between gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isOn
                    ? "border-brand-200/80 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/30"
                    : "border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${isOn ? "text-brand-900 dark:text-white" : "text-slate-800 dark:text-slate-200"}`}>
                    {label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
                <div className={`shrink-0 w-11 h-6 rounded-full flex items-center px-0.5 transition-all duration-300 ${isOn ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700"}`}>
                  <div className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${isOn ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </label>
            );
          })}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-white/10">
          <button
            className="btn-primary w-full flex items-center justify-center gap-2"
            onClick={save}
          >
            <CheckCircle2 size={16} />
            Save Notification Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
