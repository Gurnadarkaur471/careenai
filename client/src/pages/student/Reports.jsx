import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/Toast.jsx";
import { FileBarChart, Download } from "lucide-react";

export default function Reports() {
  const { push } = useToast();
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);

  const load = () => api.get("/reports").then((res) => setReports(res.data.data.reports));
  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      await api.post("/reports/generate");
      push("Report generated.");
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
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <button className="btn-primary" onClick={generate} disabled={generating}>{generating ? "Generating…" : "Generate New Report"}</button>
      </div>
      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r._id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileBarChart className="text-brand-600" />
              <div>
                <p className="font-medium text-slate-800 capitalize">{r.reportType} Report</p>
                <p className="text-xs text-slate-400">{new Date(r.generatedAt).toLocaleString()}</p>
              </div>
            </div>
            <button onClick={() => download(r._id)} className="btn-secondary flex items-center gap-1">
              <Download size={16} /> Download
            </button>
          </div>
        ))}
        {reports.length === 0 && <p className="text-slate-400 text-sm">No reports yet.</p>}
      </div>
    </div>
  );
}
