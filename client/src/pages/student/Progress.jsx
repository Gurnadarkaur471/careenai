import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../services/api";

export default function ProgressPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/progress").then((res) => {
      const data = res.data.data.history.map((h) => ({
        date: new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        Employability: h.employabilityScore,
        Technical: h.technicalScore,
        Aptitude: h.aptitudeScore,
        Resume: h.resumeScore,
        Communication: h.communicationScore,
        Interview: h.interviewScore,
      }));
      setHistory(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Progress Tracking</h1>
      <div className="card" style={{ height: 400 }}>
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm">No progress recorded yet. Complete assessments, resume analysis, or interviews to start tracking.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis domain={[0, 100]} fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Employability" stroke="#4f46e5" strokeWidth={2} />
              <Line type="monotone" dataKey="Technical" stroke="#0ea5e9" strokeWidth={1.5} />
              <Line type="monotone" dataKey="Aptitude" stroke="#22c55e" strokeWidth={1.5} />
              <Line type="monotone" dataKey="Resume" stroke="#f59e0b" strokeWidth={1.5} />
              <Line type="monotone" dataKey="Communication" stroke="#ec4899" strokeWidth={1.5} />
              <Line type="monotone" dataKey="Interview" stroke="#8b5cf6" strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
