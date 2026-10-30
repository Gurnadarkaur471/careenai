import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, FileText, ClipboardList, Briefcase, Target,
  Sparkles, Map, Mic, TrendingUp, FileBarChart, Settings, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "../components/NotificationBell.jsx";

import ThemeToggle from "../components/ThemeToggle.jsx";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume-analyzer", label: "Resume Analyzer", icon: FileText },
  { to: "/assessments", label: "Assessments", icon: ClipboardList },
  { to: "/job-intelligence", label: "Job Intelligence", icon: Briefcase },
  { to: "/skill-gap", label: "Skill Gap", icon: Target },
  { to: "/career-simulator", label: "Career Simulator", icon: Sparkles },
  { to: "/roadmap", label: "Career Roadmap", icon: Map },
  { to: "/interview-coach", label: "Interview Coach", icon: Mic },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/reports", label: "Reports", icon: FileBarChart },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="page-shell flex min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <aside className="glass-panel sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-950/60 backdrop-blur-2xl">
        <div className="border-b border-white/60 dark:border-white/10 px-6 py-5">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-md shadow-brand-500/10 ring-1 ring-slate-900/10 dark:ring-white/10 p-1 group-hover:scale-105 transition-transform duration-200">
              <img src="/images/prepwise-icon.png" alt="PrepWise" className="h-full w-full object-contain dark:hidden" />
              <img src="/images/prepwise-icon-dark.png" alt="PrepWise" className="h-full w-full object-contain hidden dark:block" />
            </div>
            <span className="text-xl font-black tracking-tight">
              <span className="text-slate-900 dark:text-white">Prep</span>
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">Wise</span>
            </span>
          </Link>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">Student workspace</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-brand-50 to-cyan-50 dark:from-brand-950/70 dark:to-cyan-950/50 text-brand-700 dark:text-brand-300 shadow-sm ring-1 ring-brand-200/60 dark:ring-brand-700/50 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/60 dark:border-white/10 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 transition hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-950/60 px-6 backdrop-blur-2xl">
          <div />
          <div className="flex items-center gap-3 md:gap-4">
            <ThemeToggle />
            <NotificationBell />
            <NavLink to="/settings" className="rounded-xl p-2 text-slate-600 dark:text-slate-400 transition hover:bg-white/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white">
              <Settings size={20} />
            </NavLink>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-brand-500/20">
              {user?.name?.[0]?.toUpperCase() || "S"}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
