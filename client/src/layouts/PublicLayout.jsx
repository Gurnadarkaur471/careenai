import React from "react";
import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <header className="sticky top-0 z-40 border-b border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-950/60 backdrop-blur-2xl shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-black/20 transition-all duration-300">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-brand-600 dark:text-brand-400 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-teal-400 text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform duration-300">
              CA
            </span>
            <span className="bg-gradient-to-r from-brand-600 to-teal-500 bg-clip-text text-transparent font-extrabold">
              CareerAI
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
        © {new Date().getFullYear()} CareerAI — AI-Powered Employability Intelligence Platform
      </footer>
    </div>
  );
}
