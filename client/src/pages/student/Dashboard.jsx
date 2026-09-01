import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import ScoreRing from "../../components/ScoreRing.jsx";
import ProgressBar from "../../components/ProgressBar.jsx";
import StatCard from "../../components/StatCard.jsx";
import { Target, Award, Briefcase } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/students/dashboard")
      .then((res) => setData(res.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400">Loading dashboard…</div>;
  if (!data) return <div className="text-slate-400">Couldn't load your dashboard yet — complete your profile to get started.</div>;

  const { employabilityScore, componentScores, biggestGap, strongestSkill, recommendedAction, targetRole, targetGoal } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Working toward <span className="font-medium">{targetGoal}</span> as a <span className="font-medium">{targetRole}</span></p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card flex flex-col items-center justify-center lg:col-span-1">
          <ScoreRing score={employabilityScore} size={160} />
          <p className="text-sm text-slate-500 mt-3 text-center">{recommendedAction}</p>
        </div>

        <div className="card lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-slate-800">Score Breakdown</h3>
          <ProgressBar label="Technical Skills" value={componentScores.technical} />
          <ProgressBar label="Aptitude" value={componentScores.aptitude} />
          <ProgressBar label="Resume" value={componentScores.resume} />
          <ProgressBar label="Communication" value={componentScores.communication} />
          <ProgressBar label="Interview" value={componentScores.interview} />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard icon={Target} label="Biggest Gap" value={biggestGap ? biggestGap[0].toUpperCase() + biggestGap.slice(1) : "—"} sub="Focus here first" />
        <StatCard icon={Award} label="Strongest Skill" value={strongestSkill || "—"} sub="Keep leveraging this" />
        <StatCard icon={Briefcase} label="Target Role" value={targetRole} sub="Set in your profile" />
        <StatCard icon={Target} label="Target Goal" value={targetGoal || "—"} sub="Personalized for you" />
      </div>
    </div>
  );
}
