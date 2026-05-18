import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("token");
const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

const authFetch = async (url, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

// ── Styles ────────────────────────────────────────────────────
const S = {
  app: { minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif" },
  nav: {
    background: "#1a237e", color: "#fff", padding: "0 2rem",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    height: 60, boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  navTitle: { fontSize: 20, fontWeight: 700, letterSpacing: 1 },
  navBtn: {
    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13,
  },
  tabs: {
    background: "#fff", display: "flex", gap: 0, borderBottom: "2px solid #e0e0e0",
    padding: "0 2rem",
  },
  tab: (active) => ({
    padding: "14px 20px", cursor: "pointer", fontSize: 14, fontWeight: 500,
    borderBottom: active ? "2px solid #1a237e" : "2px solid transparent",
    color: active ? "#1a237e" : "#666", background: "none", border: "none",
    marginBottom: -2, transition: "all 0.2s",
  }),
  page: { maxWidth: 1000, margin: "0 auto", padding: "2rem 1rem" },
  card: {
    background: "#fff", borderRadius: 12, padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "1.5rem",
  },
  h2: { fontSize: 20, fontWeight: 700, color: "#1a237e", marginBottom: "1rem" },
  label: { display: "block", fontSize: 13, color: "#555", marginBottom: 4 },
  input: {
    width: "100%", padding: "9px 12px", borderRadius: 7, fontSize: 14,
    border: "1px solid #ccc", outline: "none", boxSizing: "border-box",
    marginBottom: "1rem",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 1rem" },
  btn: (color = "#1a237e") => ({
    background: color, color: "#fff", border: "none", borderRadius: 7,
    padding: "9px 20px", cursor: "pointer", fontSize: 14, fontWeight: 600,
  }),
  btnSm: (color = "#1a237e") => ({
    background: color, color: "#fff", border: "none", borderRadius: 5,
    padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600,
  }),
  badge: (color) => ({
    display: "inline-block", background: color, color: "#fff",
    borderRadius: 12, padding: "2px 10px", fontSize: 11, fontWeight: 600,
  }),
  error: { background: "#ffebee", color: "#c62828", padding: "10px 16px", borderRadius: 8, marginBottom: "1rem", fontSize: 13 },
  success: { background: "#e8f5e9", color: "#2e7d32", padding: "10px 16px", borderRadius: 8, marginBottom: "1rem", fontSize: 13 },
  empCard: {
    background: "#fff", borderRadius: 10, padding: "1rem 1.25rem",
    boxShadow: "0 1px 6px rgba(0,0,0,0.08)", marginBottom: "0.75rem",
    display: "flex", alignItems: "center", gap: "1rem",
  },
  avatar: (score) => ({
    width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
    background: score >= 80 ? "#1a237e" : score >= 60 ? "#0277bd" : "#ef6c00",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 16,
  }),
};

const scoreColor = (s) => s >= 80 ? "#2e7d32" : s >= 60 ? "#0277bd" : "#c62828";
const deptColor = (d) => {
  const m = { Development: "#3949ab", HR: "#00897b", Sales: "#e53935", Marketing: "#f57c00", Finance: "#8e24aa" };
  return m[d] || "#546e7a";
};

// ── Auth Pages ─────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      const endpoint = mode === "login" ? "auth/login" : "auth/signup";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const data = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json());
      if (data.error) throw new Error(data.error);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuth(data.user);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...S.card, width: 380, marginBottom: 0 }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 36 }}>🏢</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a237e", margin: "8px 0 4px" }}>EmpAI Analytics</h1>
          <p style={{ color: "#888", fontSize: 13 }}>AI-Powered HR Management</p>
        </div>
        <div style={{ display: "flex", marginBottom: "1.5rem", borderRadius: 8, overflow: "hidden", border: "1px solid #e0e0e0" }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "9px 0", cursor: "pointer", fontSize: 14, fontWeight: 600,
              background: mode === m ? "#1a237e" : "#fff", color: mode === m ? "#fff" : "#555",
              border: "none", transition: "all 0.2s",
            }}>{m === "login" ? "Login" : "Sign Up"}</button>
          ))}
        </div>
        {err && <div style={S.error}>{err}</div>}
        {mode === "signup" && (
          <>
            <label style={S.label}>Full Name</label>
            <input style={S.input} placeholder="Aman Verma" value={form.name} onChange={f("name")} />
          </>
        )}
        <label style={S.label}>Email</label>
        <input style={S.input} type="email" placeholder="aman@gmail.com" value={form.email} onChange={f("email")} />
        <label style={S.label}>Password</label>
        <input style={S.input} type="password" placeholder="••••••••" value={form.password} onChange={f("password")}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
        <button style={{ ...S.btn(), width: "100%", padding: "11px" }} onClick={submit} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Login" : "Create Account"}
        </button>
      </div>
    </div>
  );
}

// ── Add Employee Form ──────────────────────────────────────────
function AddEmployee({ onAdded }) {
  const [form, setForm] = useState({ name: "", email: "", department: "Development", skills: "", performanceScore: "", experience: "" });
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setErr(""); setMsg("");
    try {
      await authFetch(`${API}/employees`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          performanceScore: Number(form.performanceScore),
          experience: Number(form.experience),
        }),
      });
      setMsg("✅ Employee added successfully!");
      setForm({ name: "", email: "", department: "Development", skills: "", performanceScore: "", experience: "" });
      onAdded();
    } catch (e) { setErr(e.message); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div style={S.card}>
      <h2 style={S.h2}>➕ Add New Employee</h2>
      {err && <div style={S.error}>{err}</div>}
      {msg && <div style={S.success}>{msg}</div>}
      <div style={S.grid2}>
        <div>
          <label style={S.label}>Full Name *</label>
          <input style={S.input} placeholder="Aman Verma" value={form.name} onChange={f("name")} />
        </div>
        <div>
          <label style={S.label}>Email *</label>
          <input style={S.input} type="email" placeholder="aman@gmail.com" value={form.email} onChange={f("email")} />
        </div>
      </div>
      <div style={S.grid3}>
        <div>
          <label style={S.label}>Department *</label>
          <select style={S.input} value={form.department} onChange={f("department")}>
            {["Development", "HR", "Sales", "Marketing", "Finance", "Operations"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={S.label}>Performance Score (0-100) *</label>
          <input style={S.input} type="number" min="0" max="100" placeholder="85" value={form.performanceScore} onChange={f("performanceScore")} />
        </div>
        <div>
          <label style={S.label}>Years of Experience *</label>
          <input style={S.input} type="number" min="0" placeholder="3" value={form.experience} onChange={f("experience")} />
        </div>
      </div>
      <label style={S.label}>Skills (comma-separated)</label>
      <input style={S.input} placeholder="React, Node.js, MongoDB" value={form.skills} onChange={f("skills")} />
      <button style={S.btn()} onClick={submit}>Add Employee</button>
    </div>
  );
}

// ── Employee Card ──────────────────────────────────────────────
function EmpCard({ emp, onDelete, onEdit }) {
  const initials = emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={S.empCard}>
      <div style={S.avatar(emp.performanceScore)}>{initials}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#1a237e" }}>{emp.name}</div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{emp.email}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={S.badge(deptColor(emp.department))}>{emp.department}</span>
          {emp.skills.slice(0, 4).map((s) => (
            <span key={s} style={S.badge("#546e7a")}>{s}</span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "right", minWidth: 90 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(emp.performanceScore) }}>{emp.performanceScore}</div>
        <div style={{ fontSize: 11, color: "#999" }}>{emp.experience}y exp</div>
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 6 }}>
          <button style={S.btnSm("#0277bd")} onClick={() => onEdit(emp)}>Edit</button>
          <button style={S.btnSm("#c62828")} onClick={() => onDelete(emp._id)}>Del</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────
function EditModal({ emp, onClose, onSaved }) {
  const [form, setForm] = useState({ ...emp, skills: emp.skills.join(", ") });
  const [err, setErr] = useState("");

  const save = async () => {
    setErr("");
    try {
      await authFetch(`${API}/employees/${emp._id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          performanceScore: Number(form.performanceScore),
          experience: Number(form.experience),
        }),
      });
      onSaved();
      onClose();
    } catch (e) { setErr(e.message); }
  };

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <div style={{ ...S.card, width: 500, maxHeight: "90vh", overflowY: "auto", marginBottom: 0 }}>
        <h2 style={S.h2}>✏️ Edit Employee</h2>
        {err && <div style={S.error}>{err}</div>}
        <label style={S.label}>Name</label>
        <input style={S.input} value={form.name} onChange={f("name")} />
        <label style={S.label}>Email</label>
        <input style={S.input} value={form.email} onChange={f("email")} />
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Department</label>
            <select style={S.input} value={form.department} onChange={f("department")}>
              {["Development", "HR", "Sales", "Marketing", "Finance", "Operations"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Performance Score</label>
            <input style={S.input} type="number" min="0" max="100" value={form.performanceScore} onChange={f("performanceScore")} />
          </div>
        </div>
        <label style={S.label}>Experience (years)</label>
        <input style={S.input} type="number" value={form.experience} onChange={f("experience")} />
        <label style={S.label}>Skills (comma-separated)</label>
        <input style={S.input} value={form.skills} onChange={f("skills")} />
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.btn()} onClick={save}>Save Changes</button>
          <button style={S.btn("#666")} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Employee List Page ─────────────────────────────────────────
function EmployeeList({ employees, loading, onDelete, onEdit, onRefresh }) {
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
      <div style={S.card}>
        <h2 style={S.h2}>🔍 Search & Filter</h2>
        <div style={S.grid3}>
          <div>
            <label style={S.label}>Search by name / email</label>
            <input style={{ ...S.input, marginBottom: 0 }} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Department</label>
            <select style={{ ...S.input, marginBottom: 0 }} value={dept} onChange={(e) => setDept(e.target.value)}>
              {depts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Min Performance Score: {minScore}</label>
            <input type="range" min="0" max="100" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))}
              style={{ width: "100%", marginTop: 8 }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <span style={{ color: "#666", fontSize: 14 }}>{filtered.length} of {employees.length} employees</span>
        <button style={S.btnSm()} onClick={onRefresh}>↻ Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#999", padding: "2rem" }}>Loading employees…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#999", padding: "2rem" }}>No employees found.</div>
      ) : (
        filtered.map((e) => <EmpCard key={e._id} emp={e} onDelete={onDelete} onEdit={onEdit} />)
      )}
    </div>
  );
}

// ── AI Recommendations Page ────────────────────────────────────
function AIPage({ employees }) {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const toggle = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const getRecommendations = async () => {
    if (!selected.length) { setErr("Select at least one employee."); return; }
    setErr(""); setLoading(true); setResult(null);
    try {
      const emps = employees.filter((e) => selected.includes(e._id));
      const data = await authFetch(`${API}/ai/recommend`, {
        method: "POST",
        body: JSON.stringify({ employees: emps }),
      });
      setResult(data);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const ratingColor = { Excellent: "#2e7d32", Good: "#0277bd", "Needs Improvement": "#c62828" };

  return (
    <div>
      <div style={S.card}>
        <h2 style={S.h2}>🤖 AI Recommendations</h2>
        <p style={{ color: "#666", fontSize: 14, marginBottom: "1rem" }}>Select employees to analyze and get AI-powered insights.</p>
        <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
          <button style={S.btnSm()} onClick={() => setSelected(employees.map((e) => e._id))}>Select All</button>
          <button style={S.btnSm("#666")} onClick={() => setSelected([])}>Clear</button>
        </div>
        <div style={{ maxHeight: 280, overflowY: "auto", border: "1px solid #e0e0e0", borderRadius: 8, padding: "0.5rem" }}>
          {employees.map((e) => (
            <div key={e._id} onClick={() => toggle(e._id)} style={{
              display: "flex", alignItems: "center", gap: "0.75rem", padding: "8px 10px",
              borderRadius: 7, cursor: "pointer", marginBottom: 4,
              background: selected.includes(e._id) ? "#e8eaf6" : "transparent",
              border: selected.includes(e._id) ? "1px solid #7986cb" : "1px solid transparent",
            }}>
              <input type="checkbox" checked={selected.includes(e._id)} onChange={() => {}} style={{ accentColor: "#1a237e" }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>{e.name}</span>
              <span style={S.badge(deptColor(e.department))}>{e.department}</span>
              <span style={{ marginLeft: "auto", fontWeight: 700, color: scoreColor(e.performanceScore) }}>{e.performanceScore}</span>
            </div>
          ))}
        </div>
        {err && <div style={{ ...S.error, marginTop: "1rem" }}>{err}</div>}
        <button style={{ ...S.btn(), marginTop: "1rem" }} onClick={getRecommendations} disabled={loading}>
          {loading ? "⏳ Analyzing with AI…" : "✨ Generate AI Recommendations"}
        </button>
      </div>

      {result && (
        <div>
          {result.note && <div style={{ ...S.success, marginBottom: "1rem" }}>{result.note}</div>}

          {result.rankings?.length > 0 && (
            <div style={S.card}>
              <h2 style={S.h2}>🏆 Employee Rankings</h2>
              {result.rankings.map((r, i) => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 16,
                    background: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#e0e0e0",
                    color: i < 3 ? "#fff" : "#555",
                  }}>#{r.rank}</div>
                  <span style={{ flex: 1, fontWeight: 600 }}>{r.name}</span>
                  <span style={{ fontWeight: 700, color: scoreColor(r.score) }}>{r.score}</span>
                </div>
              ))}
            </div>
          )}

          {result.recommendations?.map((rec) => (
            <div key={rec.name} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a237e", margin: 0 }}>{rec.name}</h3>
                {rec.overallRating && (
                  <span style={{ ...S.badge(ratingColor[rec.overallRating] || "#546e7a"), fontSize: 12 }}>{rec.overallRating}</span>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ background: rec.promotion?.eligible ? "#e8f5e9" : "#ffebee", borderRadius: 8, padding: "0.75rem" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: rec.promotion?.eligible ? "#2e7d32" : "#c62828", marginBottom: 4 }}>
                    {rec.promotion?.eligible ? "✅ Promotion Eligible" : "❌ Not Yet Eligible"}
                  </div>
                  <div style={{ fontSize: 13, color: "#555" }}>{rec.promotion?.reason}</div>
                </div>
                <div style={{ background: "#e3f2fd", borderRadius: 8, padding: "0.75rem" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0277bd", marginBottom: 4 }}>📚 Training Suggestions</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {rec.training?.map((t) => <span key={t} style={S.badge("#0277bd")}>{t}</span>)}
                  </div>
                </div>
              </div>
              {rec.feedback && (
                <div style={{ background: "#f3e5f5", borderRadius: 8, padding: "0.75rem" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#7b1fa2", marginBottom: 4 }}>💬 AI Feedback</div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{rec.feedback}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Analytics Page ─────────────────────────────────────────────
function AnalyticsPage({ employees }) {
  if (!employees.length) return <div style={{ ...S.card, textAlign: "center", color: "#999" }}>No data to analyze yet.</div>;

  const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const avgScore = avg(employees.map((e) => e.performanceScore));
  const topEmp = [...employees].sort((a, b) => b.performanceScore - a.performanceScore)[0];
  const depts = [...new Set(employees.map((e) => e.department))];
  const deptStats = depts.map((d) => {
    const group = employees.filter((e) => e.department === d);
    return { dept: d, count: group.length, avg: avg(group.map((e) => e.performanceScore)) };
  }).sort((a, b) => b.avg - a.avg);

  const bands = [
    { label: "Excellent (80-100)", range: [80, 100], color: "#2e7d32" },
    { label: "Good (60-79)", range: [60, 79], color: "#0277bd" },
    { label: "Needs Work (0-59)", range: [0, 59], color: "#c62828" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Employees", value: employees.length, icon: "👥" },
          { label: "Avg Performance", value: avgScore, icon: "📊" },
          { label: "Top Performer", value: topEmp.performanceScore, icon: "🏆" },
          { label: "Departments", value: depts.length, icon: "🏢" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "#fff", borderRadius: 10, padding: "1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>{stat.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1a237e" }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <h2 style={S.h2}>📊 Department Performance</h2>
        {deptStats.map((d) => (
          <div key={d.dept} style={{ marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{d.dept} <span style={{ color: "#999" }}>({d.count})</span></span>
              <span style={{ fontWeight: 700, color: scoreColor(d.avg) }}>{d.avg}%</span>
            </div>
            <div style={{ height: 10, background: "#f0f0f0", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${d.avg}%`, background: deptColor(d.dept), borderRadius: 5, transition: "width 0.5s" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <h2 style={S.h2}>📈 Performance Distribution</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          {bands.map((b) => {
            const count = employees.filter((e) => e.performanceScore >= b.range[0] && e.performanceScore <= b.range[1]).length;
            const pct = Math.round((count / employees.length) * 100);
            return (
              <div key={b.label} style={{ background: "#f8f9fa", borderRadius: 8, padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: b.color }}>{count}</div>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>{b.label}</div>
                <div style={{ height: 6, background: "#e0e0e0", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: b.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={S.card}>
        <h2 style={S.h2}>🏅 Top Performers</h2>
        {[...employees].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5).map((e, i) => (
          <div key={e._id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: i === 0 ? "#f57c00" : "#999", minWidth: 24 }}>#{i + 1}</div>
            <div style={S.avatar(e.performanceScore)}>{e.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{e.name}</div>
              <div style={{ fontSize: 12, color: "#999" }}>{e.department} · {e.experience}y</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: scoreColor(e.performanceScore) }}>{e.performanceScore}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(getUser());
  const [tab, setTab] = useState("list");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchEmployees = useCallback(async () => {
    if (!getToken()) return;
    setLoading(true);
    try {
      const data = await authFetch(`${API}/employees`);
      setEmployees(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { if (user) fetchEmployees(); }, [user, fetchEmployees]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await authFetch(`${API}/employees/${id}`, { method: "DELETE" });
      fetchEmployees();
    } catch (e) { alert(e.message); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) return <AuthPage onAuth={(u) => setUser(u)} />;

  const TABS = [
    { id: "add", label: "➕ Add Employee" },
    { id: "list", label: "👥 Employees" },
    { id: "ai", label: "🤖 AI Recommendations" },
    { id: "analytics", label: "📊 Analytics" },
  ];

  return (
    <div style={S.app}>
      <nav style={S.nav}>
        <span style={S.navTitle}>🏢 EmpAI Analytics</span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: 13, opacity: 0.8 }}>👤 {user.name}</span>
          <button style={S.navBtn} onClick={logout}>Logout</button>
        </div>
      </nav>
      <div style={S.tabs}>
        {TABS.map((t) => (
          <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div style={S.page}>
        {tab === "add" && <AddEmployee onAdded={() => { fetchEmployees(); setTab("list"); }} />}
        {tab === "list" && (
          <EmployeeList employees={employees} loading={loading} onDelete={handleDelete} onEdit={setEditing} onRefresh={fetchEmployees} />
        )}
        {tab === "ai" && <AIPage employees={employees} />}
        {tab === "analytics" && <AnalyticsPage employees={employees} />}
      </div>
      {editing && <EditModal emp={editing} onClose={() => setEditing(null)} onSaved={fetchEmployees} />}
    </div>
  );
}
