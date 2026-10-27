import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import { User, GraduationCap, Target, Code2, BarChart3, Save } from "lucide-react";

const TARGET_ROLES = ["Software Developer", "Data Analyst", "ML Engineer", "Product Manager", "UX Designer"];
const TARGET_GOALS = ["Land my first job", "Prepare for an internship", "Switch careers", "Get promoted", "Build job-ready skills"];

export default function Profile() {
  const { push } = useToast();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    api.get("/students/profile").then((res) => {
      setProfile(res.data.data.profile);
      setSkillsInput((res.data.data.profile.skills || []).join(", "));
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await api.put("/students/profile", { ...profile, skills });
      setProfile(res.data.data.profile);
      push("Profile updated successfully!");
    } catch (err) {
      push(err.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="card text-center py-12 text-slate-500 dark:text-slate-400">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-r-transparent mr-2 align-middle" />
        Loading profile…
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Your Identity</p>
        </div>
        <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Career Profile</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Keep your academic and career profile up-to-date for accurate AI-driven recommendations.
        </p>
      </div>

      <div className="card p-6 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl space-y-6">
        {/* Academic Info */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/60 dark:border-white/10">
            <GraduationCap size={18} className="text-brand-500" />
            <p className="font-bold text-slate-900 dark:text-white">Academic Information</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">College / Institution</label>
              <input
                className="input"
                placeholder="e.g. IIT Bombay"
                value={profile.college || ""}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Branch / Major</label>
              <input
                className="input"
                placeholder="e.g. Computer Science"
                value={profile.branch || ""}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Semester</label>
              <input
                className="input"
                placeholder="e.g. 6th"
                value={profile.semester || ""}
                onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Academic Performance (%)</label>
              <input
                className="input"
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 82"
                value={profile.academicPerformance || ""}
                onChange={(e) => setProfile({ ...profile, academicPerformance: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Career Goals */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/60 dark:border-white/10">
            <Target size={18} className="text-cyan-500" />
            <p className="font-bold text-slate-900 dark:text-white">Career Goals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Target Role</label>
              <select
                className="input"
                value={profile.targetRole || "Software Developer"}
                onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
              >
                {TARGET_ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Primary Goal</label>
              <select
                className="input"
                value={profile.targetGoal || "Land my first job"}
                onChange={(e) => setProfile({ ...profile, targetGoal: e.target.value })}
              >
                {TARGET_GOALS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/60 dark:border-white/10">
            <Code2 size={18} className="text-emerald-500" />
            <p className="font-bold text-slate-900 dark:text-white">Technical Skills</p>
          </div>
          <div>
            <label className="label">Skills (comma separated)</label>
            <textarea
              className="input"
              rows={3}
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Python, SQL, React, Git, Machine Learning, Node.js…"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Separate each skill with a comma. These directly power your skill gap analysis and job matching.
            </p>
          </div>
          {skillsInput && (
            <div className="mt-3 flex flex-wrap gap-2">
              {skillsInput.split(",").map((s) => s.trim()).filter(Boolean).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn-primary w-full flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
          onClick={save}
          disabled={saving}
        >
          <Save size={16} />
          <span>{saving ? "Saving Changes…" : "Save Profile"}</span>
        </button>
      </div>
    </div>
  );
}
