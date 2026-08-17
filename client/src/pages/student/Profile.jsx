import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";

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
      push("Profile updated.");
    } catch (err) {
      push(err.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div className="text-slate-400">Loading profile…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Your Profile</h1>
      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">College</label>
            <input className="input" value={profile.college || ""} onChange={(e) => setProfile({ ...profile, college: e.target.value })} />
          </div>
          <div>
            <label className="label">Branch</label>
            <input className="input" value={profile.branch || ""} onChange={(e) => setProfile({ ...profile, branch: e.target.value })} />
          </div>
          <div>
            <label className="label">Semester</label>
            <input className="input" value={profile.semester || ""} onChange={(e) => setProfile({ ...profile, semester: e.target.value })} />
          </div>
          <div>
            <label className="label">Target Role</label>
            <select className="input" value={profile.targetRole || ""} onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}>
              <option>Software Developer</option>
              <option>Data Analyst</option>
              <option>ML Engineer</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Skills (comma separated)</label>
          <textarea className="input" rows={3} value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="Python, SQL, React, Git" />
        </div>
        <div>
          <label className="label">Academic Performance (%)</label>
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            value={profile.academicPerformance || ""}
            onChange={(e) => setProfile({ ...profile, academicPerformance: Number(e.target.value) })}
          />
        </div>
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Profile"}</button>
      </div>
    </div>
  );
}
