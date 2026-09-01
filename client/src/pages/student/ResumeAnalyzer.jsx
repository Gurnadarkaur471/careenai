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
  const [history, setHistory] = useState([]);

  const handleUploadAndAnalyze = async () => {
    if (!file) return push("Choose a PDF or DOCX resume first.", "error");
    setUploading(true);
    setStage(0);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const uploadRes = await api.post("/resumes/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const uploadedResume = uploadRes.data.data.resume;
      const resumeId = uploadedResume._id;
      // add uploaded resume to history immediately
      setHistory((h) => [uploadedResume, ...h]);
      setUploading(false);
      setAnalyzing(true);
      setStage(1);

      // Simulate the visible staged progress while the real request runs.
      const t1 = setTimeout(() => setStage(2), 500);
      const t2 = setTimeout(() => setStage(3), 1100);

      const analyzeRes = await api.post(`/resumes/${resumeId}/analyze`);
      clearTimeout(t1); clearTimeout(t2);
      setStage(4);
      const analyzed = analyzeRes.data.data.resume;
      setResult(analyzed);
      // update history entry for this resume with the analyzed result
      setHistory((h) => [analyzed, ...h.filter((r) => r._id !== analyzed._id)]);
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

  // Fetch recent resume history
  async function fetchHistory() {
    try {
      const res = await api.get('/resumes');
      const resumes = res.data.data.resumes || [];
      setHistory(resumes);
    } catch (err) {
      // ignore silently
    }
  }

  React.useEffect(() => {
    fetchHistory();
    const id = setInterval(fetchHistory, 10000); // poll every 10s for real-time feel
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Resume Analyzer</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="bg-white border border-slate-100 rounded-xl p-6">
            <label className="block">
              <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-16 cursor-pointer hover:border-brand-300 transition">
                <div className="text-center">
                  <UploadCloud className="text-brand-500 mb-2 mx-auto" size={36} />
                  <div className="text-sm text-slate-500">{file ? file.name : "Drag and drop your resume here or click to browse (PDF, DOCX, max 5MB)"}</div>
                  <div className="mt-2 text-xs text-slate-400">Supported formats: PDF, DOCX (Max 5MB)</div>
                </div>
              </div>
              <input type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>

            <div className="mt-4 flex items-center justify-between">
              <div />
              <button className="btn-primary" onClick={handleUploadAndAnalyze} disabled={uploading || analyzing}>
                {uploading ? "Uploading…" : analyzing ? "Analyzing…" : "Analyze with AI"}
              </button>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-sm">
              <h4 className="font-semibold text-slate-700">ATS Optimization</h4>
              <p className="text-slate-500 text-sm mt-2">Ensure your resume passes Applicant Tracking Systems with keyword analysis.</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-sm">
              <h4 className="font-semibold text-slate-700">Content Review</h4>
              <p className="text-slate-500 text-sm mt-2">Checks for action verbs, quantifiable achievements, and formatting errors.</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-sm">
              <h4 className="font-semibold text-slate-700">ATS Preview</h4>
              <p className="text-slate-500 text-sm mt-2">Preview how your resume appears to recruiters and systems.</p>
            </div>
          </div>
        </div>

        <aside className="col-span-4">
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <h3 className="font-semibold text-slate-800">Analysis History</h3>
            <div className="mt-3 space-y-3">
              {history.length === 0 && <div className="text-sm text-slate-400">No analyses yet.</div>}
              {history.map((item) => (
                <div key={item._id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-slate-50 text-slate-600 flex items-center justify-center text-xs font-semibold">{(item.fileType || 'PDF').replace('.', '').toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-800">{item.fileName}</div>
                      <div className={`text-sm ${item.resumeScore >= 75 ? 'text-slate-500' : item.resumeScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{item.resumeScore ?? '—'}/100</div>
                    </div>
                    <div className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}

              <div className="mt-3">
                <button onClick={fetchHistory} className="w-full border border-slate-100 rounded-md py-2 text-sm">Refresh</button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Existing staged progress & result area below for detailed output */}
      {stage >= 0 && stage < 5 && (
        <div className="bg-white border border-slate-100 rounded-xl p-4">
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
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FileText className="text-brand-600" />
            <div>
              <p className="font-semibold text-slate-800">{result.fileName}</p>
              <p className="text-xs text-slate-400">Analyzed {result.analysis?.aiGenerated ? "with AI enrichment" : "with deterministic engine"}</p>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar label="Resume Score" value={result.resumeScore} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <ProgressBar label="Section Completeness" value={result.analysis.sectionCompleteness} />
            <ProgressBar label="Skill Relevance" value={result.analysis.skillRelevance} />
          </div>
        </div>
      )}
    </div>
  );
}
