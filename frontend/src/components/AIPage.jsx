import { useState } from "react";
import "../index.css"; // Explicitly links the unified styling classes

export default function AIPage({ employees, API, authFetch, scoreColor, deptColor }) {
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
      <div className="card-layout">
        <h2 className="heading-h2">🤖 AI Recommendations</h2>
        <p style={{ color: "#666", fontSize: 14, marginBottom: "1rem" }}>Select employees to analyze and get AI-powered insights.</p>
        <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
          <button className="btn-small" onClick={() => setSelected(employees.map((e) => e._id))}>Select All</button>
          <button className="btn-small" style={{ backgroundColor: "#666" }} onClick={() => setSelected([])}>Clear</button>
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
              <span className="badge-ui" style={{ backgroundColor: deptColor(e.department) }}>{e.department}</span>
              <span style={{ marginLeft: "auto", fontWeight: 700, color: scoreColor(e.performanceScore) }}>{e.performanceScore}</span>
            </div>
          ))}
        </div>
        {err && <div className="alert-error" style={{ marginTop: "1rem" }}>{err}</div>}
        <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={getRecommendations} disabled={loading}>
          {loading ? "⏳ Analyzing with AI…" : "✨ Generate AI Recommendations"}
        </button>
      </div>

      {result && (
        <div>
          {result.note && <div className="alert-success" style={{ marginBottom: "1rem" }}>{result.note}</div>}
          {result.rankings?.length > 0 && (
            <div className="card-layout">
              <h2 className="heading-h2">🏆 Employee Rankings</h2>
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
            <div key={rec.name} className="card-layout">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a237e", margin: 0 }}>{rec.name}</h3>
                {rec.overallRating && (
                  <span className="badge-ui" style={{ backgroundColor: ratingColor[rec.overallRating] || "#546e7a", fontSize: 12 }}>{rec.overallRating}</span>
                )}
              </div>
              <div className="grid-2" style={{ marginBottom: "1rem" }}>
                <div style={{ background: rec.promotion?.eligible ? "#e8f5e9" : "#ffebee", borderRadius: 8, padding: "0.75rem" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: rec.promotion?.eligible ? "#2e7d32" : "#c62828", marginBottom: 4 }}>
                    {rec.promotion?.eligible ? "✅ Promotion Eligible" : "❌ Not Yet Eligible"}
                  </div>
                  <div style={{ fontSize: 13, color: "#555" }}>{rec.promotion?.reason}</div>
                </div>
                <div style={{ background: "#e3f2fd", borderRadius: 8, padding: "0.75rem" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0277bd", marginBottom: 4 }}>📚 Training Suggestions</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {rec.training?.map((t) => <span key={t} className="badge-ui" style={{ backgroundColor: "#0277bd" }}>{t}</span>)}
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