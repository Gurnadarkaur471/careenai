import React, { useState } from "react";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import ProgressBar from "../../components/ProgressBar.jsx";

const STAGES = ["Resume uploaded", "Text extracted", "Identifying skills", "Evaluating projects", "Generating recommendations"];

export default function ResumeAnalyzer() {
  const { push } = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState(null);

  const handleUploadAndAnalyze = async () => {
    if (!file) return push("Choose a PDF or DOCX resume first.", "error");
    setUploading(true);
    setStage(0);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const uploadRes = await api.post("/resumes/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const resumeId = uploadRes.data.data.resume._id;
      setUploading(false);
      setAnalyzing(true);
      setStage(1);

      // Simulate the visible staged progress while the real request runs.
      const t1 = setTimeout(() => setStage(2), 500);
      const t2 = setTimeout(() => setStage(3), 1100);

      const analyzeRes = await api.post(`/resumes/${resumeId}/analyze`);
      clearTimeout(t1); clearTimeout(t2);
      setStage(4);
      setResult(analyzeRes.data.data.resume);
      setTimeout(() => setStage(5), 400);
      push("Resume analyzed successfully.");
    } catch (err) {
      push(err.response?.data?.message || "Resume analysis failed.", "error");
      setStage(-1);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Resume Analyzer</h1>

      <div className="card">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-10 cursor-pointer hover:border-brand-300 transition">
          <UploadCloud className="text-brand-500 mb-2" size={32} />
          <span className="text-sm text-slate-500">{file ? file.name : "Click to select a PDF or DOCX resume (max 5MB)"}</span>
          <input type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
        </label>
        <button className="btn-primary mt-4" onClick={handleUploadAndAnalyze} disabled={uploading || analyzing}>
          {uploading ? "Uploading…" : analyzing ? "Analyzing…" : "Upload & Analyze"}
        </button>
      </div>

      {stage >= 0 && stage < 5 && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3">Resume Analysis</h3>
          <ul className="space-y-2 text-sm">
            {STAGES.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                {i < stage ? <CheckCircle2 size={16} className="text-green-500" /> : i === stage ? <div className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                <span className={i <= stage ? "text-slate-700" : "text-slate-400"}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="text-brand-600" />
            <div>
              <p className="font-semibold text-slate-800">{result.fileName}</p>
              <p className="text-xs text-slate-400">Analyzed {result.analysis?.aiGenerated ? "with AI enrichment" : "with deterministic engine"}</p>
            </div>
          </div>
          <ProgressBar label="Resume Score" value={result.resumeScore} />
          <div className="grid grid-cols-2 gap-3">
            <ProgressBar label="Section Completeness" value={result.analysis.sectionCompleteness} />
            <ProgressBar label="Skill Relevance" value={result.analysis.skillRelevance} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Extracted Skills</h4>
            <div className="flex flex-wrap gap-2">
              {result.extractedSkills.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
          {result.analysis.suggestions?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Suggestions</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {result.analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
