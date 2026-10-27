import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle({ className = "", showLabel = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`group relative inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-400 ${
        isDark
          ? "border border-white/10 bg-slate-900/60 text-amber-300 hover:border-amber-400/40 hover:bg-slate-800/80 hover:shadow-[0_0_18px_rgba(251,191,36,0.18)]"
          : "border border-slate-200/80 bg-white/60 text-slate-700 hover:border-brand-300 hover:bg-white hover:text-brand-600 hover:shadow-[0_4px_16px_rgba(99,102,241,0.12)]"
      } backdrop-blur-xl ${className}`}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        {isDark ? (
          <Sun size={17} className="transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110 text-amber-400" />
        ) : (
          <Moon size={17} className="transition-transform duration-500 group-hover:-rotate-45 group-hover:scale-110 text-slate-700" />
        )}
      </div>
      {showLabel && (
        <span className="transition-colors duration-200">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
