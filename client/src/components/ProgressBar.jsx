import React from "react";

export default function ProgressBar({ label, value = 0 }) {
  const color =
    value >= 75
      ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/25"
      : value >= 50
      ? "bg-gradient-to-r from-amber-500 to-orange-400 shadow-sm shadow-amber-500/25"
      : "bg-gradient-to-r from-rose-500 to-red-400 shadow-sm shadow-rose-500/25";

  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-1.5">
        <span className="text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-600 dark:text-slate-400">{Math.round(value)}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-[1px] border border-slate-200/50 dark:border-white/5">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
