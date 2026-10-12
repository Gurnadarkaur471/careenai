import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/students", label: "Students", icon: Users },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="page-shell flex min-h-screen">
      <aside className="glass-panel sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-white/40 bg-white/20">
        <div className="border-b border-white/40 px-6 py-5">
          <span className="text-xl font-bold tracking-tight text-brand-700">CareerAI</span>
          <p className="mt-1 text-xs text-slate-500">Admin Console</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-brand-50 to-cyan-50 text-brand-700 shadow-sm ring-1 ring-brand-100"
                    : "text-slate-600 hover:bg-white/40 hover:text-slate-900"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/40 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white/40 hover:text-slate-900"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-30 flex h-20 items-center justify-end border-b border-white/40 bg-white/20 px-6 backdrop-blur-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-brand-500/20">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
