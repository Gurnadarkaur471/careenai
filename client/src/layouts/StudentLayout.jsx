import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, FileText, ClipboardList, Briefcase, Target,
  Sparkles, Map, Mic, TrendingUp, FileBarChart, Settings, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "../components/NotificationBell.jsx";

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
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-slate-100">
          <span className="text-xl font-bold text-brand-700">CareerAI</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 w-full">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
          <div />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <NavLink to="/settings" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <Settings size={20} />
            </NavLink>
            <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase() || "S"}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
