import React from "react";
import { Link } from "react-router-dom";
import { FileText, Briefcase, Sparkles, Mic } from "lucide-react";

const ENGINES = [
  { icon: FileText, title: "Student Intelligence", desc: "Combines your resume, academics, skills, and assessments into one structured employability profile." },
  { icon: Briefcase, title: "Job Intelligence", desc: "Analyzes job descriptions and matches you against real requirements — deterministically, not guesswork." },
  { icon: Sparkles, title: "Career Simulation", desc: "The What-If Simulator shows exactly how much each skill improvement moves your readiness score." },
  { icon: Mic, title: "AI Interview Coach", desc: "Practice resume, technical, HR, and behavioral questions with structured, actionable feedback." },
];

export default function Landing() {
  return (
    <div>
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          Know Your Readiness. Find Your Fit. <span className="text-brand-600">Build Your Career.</span>
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto">
          An AI-powered employability intelligence platform that evaluates your skills, matches you with jobs,
          identifies your gaps, simulates your career growth, and prepares you for interviews.
        </p>
        <Link to="/signup" className="btn-primary inline-block mt-8 text-base px-6 py-3">Get Started</Link>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-center text-2xl font-semibold text-slate-800 mb-10">Four AI-Powered Engines</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {ENGINES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-500 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
