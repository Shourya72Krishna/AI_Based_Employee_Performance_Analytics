import { useState } from "react";
import EmpCard from "./EmpCard";

export default function EmployeeList({ employees, loading, scoreColor, deptColor, onDelete, onEdit, onRefresh }) {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [minScore, setMinScore] = useState(0);

  const depts = ["All", ...new Set(employees.map((e) => e.department))];
  const filtered = employees.filter((e) =>
    (dept === "All" || e.department === dept) &&
    e.performanceScore >= minScore &&
    (e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="card-layout">
        <h2 className="heading-h2">🔍 Search & Filter</h2>
        <div className="grid-3">
          <div>
            <label className="input-label">Search by name / email</label>
            <input className="form-input" style={{ marginBottom: 0 }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Department</label>
            <select className="form-input" style={{ marginBottom: 0 }} value={dept} onChange={(e) => setDept(e.target.value)}>
              {depts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Min Performance Score: {minScore}</label>
            <input type="range" min="0" max="100" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} style={{ width: "100%", marginTop: 8 }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span style={{ color: "#666", fontSize: 14 }}>{filtered.length} of {employees.length} employees</span>
        <button className="btn-small" onClick={onRefresh}>↻ Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#999", padding: "2rem" }}>Loading employees…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No employees found.</div>
      ) : (
        filtered.map((e) => (
          <EmpCard key={e._id} emp={e} scoreColor={scoreColor} deptColor={deptColor} onDelete={onDelete} onEdit={onEdit} />
        ))
      )}
    </div>
  );
}