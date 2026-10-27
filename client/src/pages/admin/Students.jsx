import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Search, Users2, TrendingUp } from "lucide-react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const load = () => api.get("/admin/students", { params: { search } }).then((res) => setStudents(res.data.data.students || []));

  useEffect(() => { load(); }, []);

  const getScoreStyle = (score) => {
    if (score >= 75) return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50";
    if (score >= 50) return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50";
    return "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Student Management</p>
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Students</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              className="input pl-9 w-64"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
            <Search size={15} className="absolute left-3 top-3.5 text-slate-400" />
          </div>
          <button className="btn-secondary" onClick={load}>Search</button>
        </div>
      </div>

      <div className="card overflow-x-auto border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/10">
              <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Name</th>
              <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</th>
              <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Branch</th>
              <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Employability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80 dark:divide-white/5">
            {students.map(({ user, profile }) => (
              <tr key={user._id} className="hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {user.name}
                  </div>
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">{user.email}</td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">{user.branch || <span className="text-slate-400">—</span>}</td>
                <td className="py-3.5 px-5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getScoreStyle(profile.employabilityScore)}`}>
                    {profile.employabilityScore}%
                  </span>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <Users2 size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No students found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
