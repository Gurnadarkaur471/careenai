import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import ProgressBar from "../../components/ProgressBar.jsx";

export function InterviewList() {
  const [interviews, setInterviews] = useState([]);
  const [practice, setPractice] = useState({ practiceMode: "placement", focusTopic: "", company: "", targetRole: "Software Developer" });
  const [historySearch, setHistorySearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useToast();
  const [starting, setStarting] = useState(false);
  const autoStarted = useRef(false);

  const startNew = async (setup = practice) => {
    setStarting(true);
    try {
      const res = await api.post("/interviews/generate", setup);
      navigate(`/interview-coach/${res.data.data.interview._id}`);
    } catch (err) {
      push(err.response?.data?.message || "Could not start interview.", "error");
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    api.get("/interviews").then((res) => setInterviews(res.data.data.interviews));
    const pendingPractice = location.state?.practice;
    if (pendingPractice && !autoStarted.current) {
      autoStarted.current = true;
      const setup = { ...practice, ...pendingPractice };
      setPractice((current) => ({ ...current, ...pendingPractice }));
      startNew(setup);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.key]);

  const visibleInterviews = interviews.filter((interview) => {
    const searchable = [interview.targetRole, interview.company, interview.focusTopic, interview.practiceMode].join(" ").toLowerCase();
    return searchable.includes(historySearch.toLowerCase());
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Practice studio</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-800">Placement & interview prep</h1>
        <p className="mt-2 text-slate-500">Choose a company, role, or topic to shape your next practice session.</p>
      </div>
      <form onSubmit={(event) => { event.preventDefault(); startNew(); }} className="card space-y-5">
        <div className="flex" role="group" aria-label="Practice mode">
          {[{ value: "placement", label: "Placement prep" }, { value: "interview", label: "Mock interview" }].map((mode, index) => (
            <button
              type="button"
              key={mode.value}
              aria-pressed={practice.practiceMode === mode.value}
              onClick={() => setPractice({ ...practice, practiceMode: mode.value })}
              className={`${index === 0 ? "rounded-l-lg" : "rounded-r-lg border-l-0"} border px-4 py-2 text-sm font-semibold ${practice.practiceMode === mode.value ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <input className="input" aria-label="Topic" placeholder="Topic or role" value={practice.focusTopic} onChange={(event) => setPractice({ ...practice, focusTopic: event.target.value })} />
          <input className="input" aria-label="Company" placeholder="Company (optional)" value={practice.company} onChange={(event) => setPractice({ ...practice, company: event.target.value })} />
          <input className="input" aria-label="Target role" placeholder="Target role" value={practice.targetRole} onChange={(event) => setPractice({ ...practice, targetRole: event.target.value })} />
          <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2" disabled={starting}>
            <Search size={17} /> {starting ? "Preparing…" : "Start practice"}
          </button>
        </div>
      </form>
      <div className="space-y-3">
        <label className="relative block max-w-md">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Filter your practice history" aria-label="Filter practice history" value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} />
        </label>
        {visibleInterviews.map((iv) => (
          <div key={iv._id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">{iv.company ? `${iv.company} · ` : ""}{iv.focusTopic || iv.targetRole} — {iv.practiceMode === "placement" ? "Placement prep" : "Mock interview"}</p>
              <p className="mt-1 text-xs text-slate-400">Role: {iv.targetRole}</p>
              <p className="text-xs text-slate-400">{iv.status === "completed" ? `Score: ${iv.finalScore}%` : "In progress"}</p>
            </div>
            <Link to={`/interview-coach/${iv._id}${iv.status === "completed" ? "/report" : ""}`} className="btn-secondary">
              {iv.status === "completed" ? "View Report" : "Continue"}
            </Link>
          </div>
        ))}
        {visibleInterviews.length === 0 && <p className="text-slate-400 text-sm">{historySearch ? "No practice sessions match your search." : "No practice sessions yet. Choose a company or topic above to get started."}</p>}
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
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    api.get(`/interviews/${id}`).then((res) => setInterview(res.data.data.interview));
  }, [id]);

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    setVoiceSupported(Boolean(SpeechRecognitionCtor));

    if (!SpeechRecognitionCtor) return undefined;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        setAnswerText((current) => (current ? `${current} ${transcript}` : transcript));
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      push("Voice input could not be started. Please try again.", "error");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [push]);

  const startListening = () => {
    if (!recognitionRef.current) {
      push("Voice input is not supported in this browser.", "error");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current.start();
    setIsListening(true);
  };

  const readQuestionAloud = () => {
    if (!("speechSynthesis" in window)) {
      push("Audio playback is not supported in this browser.", "error");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(interview?.questions?.[index]?.question || "");
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

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
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-medium text-slate-800">{q.question}</p>
          <button className="btn-secondary !px-3 !py-2 text-xs" onClick={readQuestionAloud} type="button">
            🔊 Listen
          </button>
        </div>
        <textarea className="input mt-3" rows={5} placeholder="Type your answer or use voice input…" value={answerText} onChange={(e) => setAnswerText(e.target.value)} />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button className="btn-primary" onClick={submitAnswer} disabled={submitting}>{submitting ? "Evaluating…" : "Submit Answer"}</button>

          {voiceSupported ? (
            <button
              type="button"
              className={isListening ? "btn-secondary border-rose-300 bg-rose-50 text-rose-700" : "btn-secondary"}
              onClick={startListening}
            >
              {isListening ? "Stop mic" : "🎙️ Use microphone"}
            </button>
          ) : (
            <span className="text-xs text-slate-400">Voice input is unavailable in this browser.</span>
          )}
        </div>
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
