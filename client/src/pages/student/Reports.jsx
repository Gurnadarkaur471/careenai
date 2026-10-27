import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import { FileBarChart, Download, Sparkles, Calendar, FileText } from "lucide-react";

const TYPE_STYLE = {
  comprehensive: "bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border-brand-200/80 dark:border-brand-500/30",
  resume: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40",
  interview: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/40",
};

export default function Reports() {
  const { push } = useToast();
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);

  const load = () => api.get("/reports").then((res) => setReports(res.data.data.reports || []));
  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      await api.post("/reports/generate");
      push("Career report generated successfully!");
      load();
    } catch (err) {
      push(err.response?.data?.message || "Could not generate report.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const download = async (id) => {
    const res = await api.get(`/reports/${id}`);
    const blob = new Blob([JSON.stringify(res.data.data.report.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `careerai-report-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">AI-Generated Documents</p>
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Career Reports</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Auto-generated comprehensive career diagnostic reports based on your current profile data.
          </p>
        </div>
        <button
          className="btn-primary shrink-0 inline-flex items-center gap-2 shadow-lg shadow-brand-500/25"
          onClick={generate}
          disabled={generating}
        >
          <Sparkles size={16} />
          <span>{generating ? "Generating…" : "Generate New Report"}</span>
        </button>
      </div>

      <div className="space-y-3">
        {reports.map((r) => {
          const typeClass = TYPE_STYLE[r.reportType?.toLowerCase()] || TYPE_STYLE.comprehensive;
          return (
            <div
              key={r._id}
              className="card flex items-center justify-between p-5 border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-400 shadow-sm">
                  <FileBarChart size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-slate-900 dark:text-white capitalize">{r.reportType} Report</p>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border capitalize ${typeClass}`}>
                      {r.reportType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(r.generatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => download(r._id)}
                className="btn-secondary flex items-center gap-2 text-xs font-bold"
              >
                <Download size={15} />
                <span>Download JSON</span>
              </button>
            </div>
          );
        })}

        {reports.length === 0 && (
          <div className="card text-center py-14 border-dashed border-2 border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-slate-900/40">
            <FileText size={36} className="mx-auto text-slate-400 mb-2" />
            <p className="text-slate-700 dark:text-slate-300 font-bold">No reports generated yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "Generate New Report" to create your first career diagnostic.</p>
          </div>
        )}
      </div>
    </div>
  );
}
