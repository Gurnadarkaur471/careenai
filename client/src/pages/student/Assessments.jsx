import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";

export function AssessmentList() {
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    api.get("/assessments").then((res) => setAssessments(res.data.data.assessments));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Assessments</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {assessments.map((a) => (
          <div key={a._id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">{a.title}</p>
              <p className="text-xs text-slate-400 capitalize">{a.category} • {a.duration} min • {a.difficulty}</p>
            </div>
            <Link to={`/assessments/${a._id}`} className="btn-primary">Start</Link>
          </div>
        ))}
        {assessments.length === 0 && <p className="text-slate-400">No assessments available yet. Ask your admin to seed some.</p>}
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
      push(`Submitted! Score: ${res.data.data.result.score}%`);
      navigate("/progress");
    } catch (err) {
      push(err.response?.data?.message || "Submission failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!assessment) return <div className="text-slate-400">Loading assessment…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{assessment.title}</h1>
      {assessment.questions.map((q, i) => (
        <div key={q._id} className="card">
          <p className="font-medium text-slate-800 mb-3">{i + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={q._id}
                  checked={answers[q._id] === idx}
                  onChange={() => setAnswers({ ...answers, [q._id]: idx })}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button className="btn-primary" onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : "Submit Assessment"}</button>
    </div>
  );
}
