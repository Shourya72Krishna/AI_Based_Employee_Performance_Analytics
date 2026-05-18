import { useState, useEffect, useCallback } from "react";
import "./index.css"; // Imports the unified layout styles

import AuthPage from "./components/AuthPage";
import AddEmployee from "./components/AddEmployee";
import EmployeeList from "./components/EmployeeList";
import AIPage from "./components/AIPage";
import AnalyticsPage from "./components/AnalyticsPage";
import EditModal from "./components/EditModal";

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

// Deterministic status colors
const scoreColor = (s) => s >= 80 ? "#2e7d32" : s >= 60 ? "#0277bd" : "#c62828";
const deptColor = (d) => {
  const m = { Development: "#3949ab", HR: "#00897b", Sales: "#e53935", Marketing: "#f57c00", Finance: "#8e24aa" };
  return m[d] || "#546e7a";
};

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

  // Safe fallback to Auth wrapper view
  if (!user) return <AuthPage API={API} onAuth={(u) => setUser(u)} />;

  const TABS = [
    { id: "add", label: "➕ Add Employee" },
    { id: "list", label: "👥 Employees" },
    { id: "ai", label: "🤖 AI Recommendations" },
    { id: "analytics", label: "📊 Analytics" },
  ];

  return (
    <div className="app-container">
      <nav className="nav-bar">
        <span className="nav-title">🏢 EmpAI Analytics</span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: 13, opacity: 0.8 }}>👤 {user.name}</span>
          <button className="nav-btn" onClick={logout}>Logout</button>
        </div>
      </nav>
      
      <div className="tabs-container">
        {TABS.map((t) => (
          <button 
            key={t.id} 
            className={`tab-button ${tab === t.id ? "active" : ""}`} 
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="page-container">
        {tab === "add" && <AddEmployee API={API} authFetch={authFetch} onAdded={() => { fetchEmployees(); setTab("list"); }} />}
        {tab === "list" && (
          <EmployeeList employees={employees} loading={loading} scoreColor={scoreColor} deptColor={deptColor} onDelete={handleDelete} onEdit={setEditing} onRefresh={fetchEmployees} />
        )}
        {tab === "ai" && <AIPage employees={employees} API={API} authFetch={authFetch} scoreColor={scoreColor} deptColor={deptColor} />}
        {tab === "analytics" && <AnalyticsPage employees={employees} scoreColor={scoreColor} deptColor={deptColor} />}
      </div>
      
      {editing && <EditModal emp={editing} API={API} authFetch={authFetch} onClose={() => setEditing(null)} onSaved={fetchEmployees} />}
    </div>
  );
}