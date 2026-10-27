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
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-950 group">
        <div className="relative aspect-[21/7] md:aspect-[4/1] overflow-hidden">
          <img
            src="/images/career-coaching.jpg"
            alt="AI Career Coaching Hub"
            className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent flex items-center p-6 md:p-8">
            <div className="text-white max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/30 text-brand-300 border border-brand-400/30 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
                AI Employability Intelligence
              </span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Welcome back, {user?.name?.split(" ")[0]} 👋
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1">
                Targeting <span className="font-semibold text-white">{targetRole || "Software Developer"}</span> · Goal: <span className="font-semibold text-emerald-400">{targetGoal || "Placement"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card flex flex-col items-center justify-center lg:col-span-1">
          <ScoreRing score={employabilityScore} size={160} />
          <p className="text-sm text-slate-500 mt-3 text-center">{recommendedAction}</p>
        </div>

        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Score Breakdown</h3>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-full border border-brand-200/60 dark:border-brand-800/60">
              5 Core Dimensions
            </span>
          </div>
          <ProgressBar label="Technical Skills" value={componentScores.technical} />
          <ProgressBar label="Aptitude" value={componentScores.aptitude} />
          <ProgressBar label="Resume" value={componentScores.resume} />
          <ProgressBar label="Communication" value={componentScores.communication} />
          <ProgressBar label="Interview" value={componentScores.interview} />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard icon={Target} label="Biggest Gap" value={biggestGap ? biggestGap[0].toUpperCase() + biggestGap.slice(1) : "—"} sub="Focus here first" color="purple" />
        <StatCard icon={Award} label="Strongest Skill" value={strongestSkill || "—"} sub="Keep leveraging this" color="emerald" />
        <StatCard icon={Briefcase} label="Target Role" value={targetRole} sub="Set in your profile" color="brand" />
        <StatCard icon={Target} label="Target Goal" value={targetGoal || "—"} sub="Personalized for you" color="amber" />
      </div>
    </div>
  );
}
