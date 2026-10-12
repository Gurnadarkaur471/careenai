import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col text-slate-800">
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/25 backdrop-blur-xl shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-brand-700">
            CareerAI
          </Link>
          <nav className="flex items-center gap-3">
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
      <footer className="border-t border-white/40 bg-white/20 py-6 text-center text-sm text-slate-500 backdrop-blur-xl">
        © {new Date().getFullYear()} CareerAI — AI-Powered Employability Intelligence Platform
      </footer>
    </div>
  );
}
