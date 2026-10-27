import React from "react";

export default function StatCard({ icon: Icon, label, value, sub, color = "brand" }) {
  const colorMap = {
    brand: "from-indigo-500 to-indigo-600 text-white shadow-indigo-500/25",
    indigo: "from-indigo-500 to-violet-600 text-white shadow-indigo-500/25",
    emerald: "from-emerald-500 to-teal-600 text-white shadow-emerald-500/25",
    purple: "from-purple-500 to-pink-600 text-white shadow-purple-500/25",
    amber: "from-amber-500 to-orange-600 text-white shadow-amber-500/25",
    cyan: "from-cyan-500 to-sky-600 text-white shadow-cyan-500/25",
    sky: "from-sky-400 to-blue-600 text-white shadow-sky-500/25",
    rose: "from-rose-500 to-red-600 text-white shadow-rose-500/25",
    pink: "from-pink-500 to-fuchsia-600 text-white shadow-pink-500/25",
  };

  const bgGradient = colorMap[color] || colorMap.brand;

  return (
    <div className="card flex items-center gap-4 group hover:scale-[1.02] transition-transform">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bgGradient} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} className="text-white" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5 font-medium">{sub}</p>}
      </div>
    </div>
  );
}
