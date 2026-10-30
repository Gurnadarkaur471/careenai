import React from "react";
import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <header className="sticky top-0 z-40 border-b border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-950/60 backdrop-blur-2xl shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-black/20 transition-all duration-300">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-md shadow-brand-500/10 ring-1 ring-slate-900/10 dark:ring-white/10 p-1 group-hover:scale-105 transition-transform duration-300">
              <img src="/images/prepwise-icon.png" alt="PrepWise" className="h-full w-full object-contain dark:hidden" />
              <img src="/images/prepwise-icon-dark.png" alt="PrepWise" className="h-full w-full object-contain hidden dark:block" />
            </div>
            <span className="text-2xl font-black tracking-tight">
              <span className="text-slate-900 dark:text-white">Prep</span>
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">Wise</span>
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/signup" className="btn-primary">
              Get Started
            </Link>
          </nav>
        </div>
      </header>
      <main className="page-shell flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/60 dark:border-white/10 bg-white/30 dark:bg-slate-950/40 py-6 text-center text-sm text-slate-500 dark:text-slate-400 backdrop-blur-xl transition-colors duration-300">
        © {new Date().getFullYear()} PrepWise — AI Powered Placement Readiness Platform
      </footer>
    </div>
  );
}
