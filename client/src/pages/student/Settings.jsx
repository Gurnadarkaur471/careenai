import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";

const LABELS = {
  assessmentResults: "Assessment Results",
  interviewReports: "Interview Reports",
  resumeAnalysis: "Resume Analysis",
  careerProgress: "Career Progress",
  careerRecommendations: "Career Recommendations",
  marketing: "Marketing / Promotional Emails",
};

export default function Settings() {
  const { push } = useToast();
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    // Preferences live on the User document; fetched via /auth/me
    api.get("/auth/me").then((res) => setPrefs(res.data.data.user.emailPreferences || {}));
  }, []);

  const toggle = (key) => setPrefs({ ...prefs, [key]: !prefs[key] });

  const save = async () => {
    try {
      // NOTE: a PUT /api/students/email-preferences endpoint is a natural next addition;
      // for now this demonstrates the intended UI/UX described in the spec.
      push("Preferences saved locally. Wire this to a backend endpoint to persist across sessions.");
    } catch (err) {
      push("Could not save preferences.", "error");
    }
  };

  if (!prefs) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Email Notifications</h1>
      <div className="card space-y-3">
        {Object.entries(LABELS).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between text-sm">
            <span className="text-slate-700">{label}</span>
            <input type="checkbox" checked={!!prefs[key]} onChange={() => toggle(key)} />
          </label>
        ))}
        <button className="btn-primary mt-2" onClick={save}>Save Preferences</button>
      </div>
    </div>
  );
}
