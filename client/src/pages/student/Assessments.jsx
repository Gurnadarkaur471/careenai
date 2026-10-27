import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import { BookOpen, Clock, Award, ArrowRight, CheckCircle2, ChevronLeft, HelpCircle } from "lucide-react";

const DIFFICULTY_STYLE = {
  beginner: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40",
  intermediate: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40",
  advanced: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40",
};

export function AssessmentList() {
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    api.get("/assessments").then((res) => setAssessments(res.data.data.assessments || []));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Knowledge Benchmarking</p>
        </div>
        <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Technical & Aptitude Assessments</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Validate your knowledge, level up verified credentials, and fuel your employability index.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {assessments.map((a) => {
          const diffClass = DIFFICULTY_STYLE[a.difficulty?.toLowerCase()] || DIFFICULTY_STYLE.intermediate;
          return (
            <div
              key={a._id}
              className="card flex flex-col justify-between p-6 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-500/30 text-brand-700 dark:text-brand-300 capitalize">
                    <BookOpen size={12} /> {a.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${diffClass}`}>
                    {a.difficulty}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{a.title}</h3>
                <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" /> {a.duration} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Award size={14} className="text-slate-400" /> Multiple Choice
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/10 flex justify-end">
                <Link
                  to={`/assessments/${a._id}`}
                  className="btn-primary inline-flex items-center gap-1.5 text-xs font-bold"
                >
                  <span>Start Assessment</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
        {assessments.length === 0 && (
          <div className="col-span-2 card text-center py-12 border-dashed border-2 border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-900/40">
            <HelpCircle size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-slate-700 dark:text-slate-300 font-bold">No assessments published yet.</p>
            <p className="text-xs text-slate-400 mt-1">Check back soon or consult your platform administrator.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AssessmentRunner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/assessments/${id}`).then((res) => setAssessment(res.data.data.assessment));
  }, [id]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex })),
        timeTaken: Math.round((Date.now() - startTime) / 1000),
      };
      const res = await api.post(`/assessments/${id}/submit`, payload);
      push(`Assessment completed! Score: ${res.data.data.result.score}%`);
      navigate("/progress");
    } catch (err) {
      push(err.response?.data?.message || "Submission failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!assessment) {
    return (
      <div className="card text-center py-12 text-slate-500 dark:text-slate-400">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-r-transparent mr-2 align-middle" />
        Loading assessment questions…
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = assessment.questions.length;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/assessments")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <ChevronLeft size={16} /> Back to assessments
        </button>
        <span className="text-xs font-bold rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-500/30 px-3 py-1 text-brand-700 dark:text-brand-300">
          Answered {answeredCount} of {totalCount}
        </span>
      </div>

      <div className="card p-6 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{assessment.title}</h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 capitalize">
          {assessment.category} • {assessment.duration} min duration
        </p>
      </div>

      <div className="space-y-4">
        {assessment.questions.map((q, i) => (
          <div
            key={q._id}
            className="card p-6 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl"
          >
            <p className="font-bold text-slate-900 dark:text-white mb-4 text-base">
              <span className="text-brand-600 dark:text-brand-400 mr-1.5">{i + 1}.</span> {q.question}
            </p>
            <div className="space-y-2.5">
              {q.options.map((opt, idx) => {
                const isSelected = answers[q._id] === idx;
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/80 dark:bg-brand-950/50 text-brand-900 dark:text-white shadow-sm ring-1 ring-brand-400"
                        : "border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q._id}
                      checked={isSelected}
                      onChange={() => setAnswers({ ...answers, [q._id]: idx })}
                      className="accent-brand-600 h-4 w-4"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25"
          onClick={submit}
          disabled={submitting}
        >
          <CheckCircle2 size={18} />
          <span>{submitting ? "Submitting Answers…" : `Submit Assessment (${answeredCount}/${totalCount} answered)`}</span>
        </button>
      </div>
    </div>
  );
}
