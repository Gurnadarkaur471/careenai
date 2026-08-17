import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import ProgressBar from "../../components/ProgressBar.jsx";

export function InterviewList() {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();
  const { push } = useToast();
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api.get("/interviews").then((res) => setInterviews(res.data.data.interviews));
  }, []);

  const startNew = async () => {
    setStarting(true);
    try {
      const res = await api.post("/interviews/generate", {});
      navigate(`/interview-coach/${res.data.data.interview._id}`);
    } catch (err) {
      push(err.response?.data?.message || "Could not start interview.", "error");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">AI Interview Coach</h1>
        <button className="btn-primary" onClick={startNew} disabled={starting}>{starting ? "Starting…" : "Start New Interview"}</button>
      </div>
      <div className="space-y-3">
        {interviews.map((iv) => (
          <div key={iv._id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">{iv.targetRole} — {iv.interviewType}</p>
              <p className="text-xs text-slate-400">{iv.status === "completed" ? `Score: ${iv.finalScore}%` : "In progress"}</p>
            </div>
            <Link to={`/interview-coach/${iv._id}${iv.status === "completed" ? "/report" : ""}`} className="btn-secondary">
              {iv.status === "completed" ? "View Report" : "Continue"}
            </Link>
          </div>
        ))}
        {interviews.length === 0 && <p className="text-slate-400 text-sm">No interviews yet. Start one to practice with AI-generated questions.</p>}
      </div>
    </div>
  );
}

export function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [interview, setInterview] = useState(null);
  const [index, setIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    api.get(`/interviews/${id}`).then((res) => setInterview(res.data.data.interview));
  }, [id]);

  const submitAnswer = async () => {
    if (!answerText.trim()) return push("Type an answer first.", "error");
    setSubmitting(true);
    try {
      const res = await api.post(`/interviews/${id}/answer`, { questionIndex: index, answerText });
      setLastFeedback(res.data.data.answer);
      push("Answer evaluated.");
    } catch (err) {
      push(err.response?.data?.message || "Evaluation failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const finish = async () => {
    setCompleting(true);
    try {
      await api.post(`/interviews/${id}/complete`);
      navigate(`/interview-coach/${id}/report`);
    } catch (err) {
      push(err.response?.data?.message || "Could not complete interview.", "error");
    } finally {
      setCompleting(false);
    }
  };

  if (!interview) return <div className="text-slate-400">Loading…</div>;
  const q = interview.questions[index];

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{interview.targetRole} Interview</h1>
      <div className="card">
        <span className="text-xs font-semibold text-brand-600 uppercase">{q.category}</span>
        <p className="font-medium text-slate-800 mt-1">{q.question}</p>
        <textarea className="input mt-3" rows={5} placeholder="Type your answer…" value={answerText} onChange={(e) => setAnswerText(e.target.value)} />
        <button className="btn-primary mt-3" onClick={submitAnswer} disabled={submitting}>{submitting ? "Evaluating…" : "Submit Answer"}</button>
      </div>

      {lastFeedback && (
        <div className="card space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <ProgressBar label="Technical" value={lastFeedback.scores.technicalScore} />
            <ProgressBar label="Relevance" value={lastFeedback.scores.relevanceScore} />
            <ProgressBar label="Structure" value={lastFeedback.scores.structureScore} />
            <ProgressBar label="Completeness" value={lastFeedback.scores.completenessScore} />
          </div>
          <p className="text-sm text-slate-600">{lastFeedback.feedback}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="btn-secondary" disabled={index === 0} onClick={() => { setIndex(index - 1); setAnswerText(""); setLastFeedback(null); }}>Previous</button>
          <button className="btn-secondary" disabled={index === interview.questions.length - 1} onClick={() => { setIndex(index + 1); setAnswerText(""); setLastFeedback(null); }}>Next</button>
        </div>
        <button className="btn-primary" onClick={finish} disabled={completing}>{completing ? "Finishing…" : "Complete Interview"}</button>
      </div>
      <p className="text-xs text-slate-400">Question {index + 1} of {interview.questions.length}</p>
    </div>
  );
}

export function InterviewReport() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    api.get(`/interviews/${id}`).then((res) => setInterview(res.data.data.interview));
  }, [id]);

  if (!interview) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Interview Report</h1>
      <div className="card text-center">
        <p className="text-4xl font-bold text-brand-600">{interview.finalScore}%</p>
        <p className="text-slate-500 text-sm mt-1">Overall Interview Score</p>
      </div>
      <div className="card grid grid-cols-2 gap-4">
        <ProgressBar label="Technical" value={interview.scoreBreakdown.technical} />
        <ProgressBar label="Relevance" value={interview.scoreBreakdown.relevance} />
        <ProgressBar label="Structure" value={interview.scoreBreakdown.structure} />
        <ProgressBar label="Completeness" value={interview.scoreBreakdown.completeness} />
      </div>
      <div className="space-y-3">
        {interview.answers.map((a) => (
          <div key={a.questionIndex} className="card">
            <p className="text-sm font-medium text-slate-800">{interview.questions[a.questionIndex]?.question}</p>
            <p className="text-sm text-slate-500 mt-1 italic">"{a.answerText}"</p>
            <p className="text-sm text-slate-600 mt-2">{a.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
