import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const load = () => api.get("/admin/students", { params: { search } }).then((res) => setStudents(res.data.data.students));

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <div className="flex gap-2">
          <input className="input" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn-secondary" onClick={load}>Search</button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Branch</th>
              <th className="py-2 pr-4">Employability</th>
            </tr>
          </thead>
          <tbody>
            {students.map(({ user, profile }) => (
              <tr key={user._id} className="border-b border-slate-50">
                <td className="py-2 pr-4 font-medium text-slate-800">{user.name}</td>
                <td className="py-2 pr-4 text-slate-500">{user.email}</td>
                <td className="py-2 pr-4 text-slate-500">{user.branch || "—"}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    profile.employabilityScore >= 75 ? "bg-green-50 text-green-700" :
                    profile.employabilityScore >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                  }`}>
                    {profile.employabilityScore}%
                  </span>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-slate-400">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
