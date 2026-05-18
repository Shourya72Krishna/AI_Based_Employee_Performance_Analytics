export default function EmpCard({ emp, scoreColor, deptColor, onDelete, onEdit }) {
  const initials = emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  
  // Keep original score background logic completely intact
  const dynamicAvatarBg = emp.performanceScore >= 80 ? "#1a237e" : emp.performanceScore >= 60 ? "#0277bd" : "#ef6c00";

  return (
    <div className="employee-card">
      <div className="avatar-circle" style={{ backgroundColor: dynamicAvatarBg }}>{initials}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#1a237e" }}>{emp.name}</div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{emp.email}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span className="badge-ui" style={{ backgroundColor: deptColor(emp.department) }}>{emp.department}</span>
          {emp.skills.slice(0, 4).map((s) => (
            <span key={s} className="badge-ui" style={{ backgroundColor: "#546e7a" }}>{s}</span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "right", minWidth: 90 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(emp.performanceScore) }}>{emp.performanceScore}</div>
        <div style={{ fontSize: 11, color: "#999" }}>{emp.experience}y exp</div>
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 6 }}>
          <button className="btn-small" style={{ backgroundColor: "#0277bd" }} onClick={() => onEdit(emp)}>Edit</button>
          <button className="btn-small" style={{ backgroundColor: "#c62828" }} onClick={() => onDelete(emp._id)}>Del</button>
        </div>
      </div>
    </div>
  );
}