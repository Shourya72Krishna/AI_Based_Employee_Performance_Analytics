import { useState } from "react";

export default function AddEmployee({ API, authFetch, onAdded }) {
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
    <div className="card-layout">
      <h2 className="heading-h2">➕ Add New Employee</h2>
      {err && <div className="alert-error">{err}</div>}
      {msg && <div className="alert-success">{msg}</div>}
      <div className="grid-2">
        <div>
          <label className="input-label">Full Name *</label>
          <input className="form-input" placeholder="Aman Verma" value={form.name} onChange={f("name")} />
        </div>
        <div>
          <label className="input-label">Email *</label>
          <input className="form-input" type="email" placeholder="aman@gmail.com" value={form.email} onChange={f("email")} />
        </div>
      </div>
      <div className="grid-3">
        <div>
          <label className="input-label">Department *</label>
          <select className="form-input" value={form.department} onChange={f("department")}>
            {["Development", "HR", "Sales", "Marketing", "Finance", "Operations"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="input-label">Performance Score (0-100) *</label>
          <input className="form-input" type="number" min="0" max="100" placeholder="85" value={form.performanceScore} onChange={f("performanceScore")} />
        </div>
        <div>
          <label className="input-label">Years of Experience *</label>
          <input className="form-input" type="number" min="0" placeholder="3" value={form.experience} onChange={f("experience")} />
        </div>
      </div>
      <label className="input-label">Skills (comma-separated)</label>
      <input className="form-input" placeholder="React, Node.js, MongoDB" value={form.skills} onChange={f("skills")} />
      <button className="btn-primary" onClick={submit}>Add Employee</button>
    </div>
  );
}