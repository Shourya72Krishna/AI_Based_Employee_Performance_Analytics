import "../index.css"; // Explicitly links the unified styling classes

export default function AnalyticsPage({ employees, scoreColor, deptColor }) {
  if (!employees.length) return <div className="card-layout" style={{ textAlign: "center", color: "#999" }}>No data to analyze yet.</div>;

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

      <div className="card-layout">
        <h2 className="heading-h2">📊 Department Performance</h2>
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

      <div className="card-layout">
        <h2 className="heading-h2">📈 Performance Distribution</h2>
        <div className="grid-3">
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

      <div className="card-layout">
        <h2 className="heading-h2">🏅 Top Performers</h2>
        {[...employees].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5).map((e, i) => (
          <div key={e._id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: i === 0 ? "#f57c00" : "#999", minWidth: 24 }}>#{i + 1}</div>
            <div className="avatar-circle" style={{ backgroundColor: scoreColor(e.performanceScore) }}>{e.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
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