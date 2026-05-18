import { useState } from "react";

export default function EditModal({ emp, API, authFetch, onClose, onSaved }) {
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
    <div className="modal-overlay">
      <div className="card-layout" style={{ width: 500, maxHeight: "90vh", overflowY: "auto", marginBottom: 0 }}>
        <h2 className="heading-h2">✏️ Edit Employee</h2>
        {err && <div className="alert-error">{err}</div>}
        <label className="input-label">Name</label>
        <input className="form-input" value={form.name} onChange={f("name")} />
        <label className="input-label">Email</label>
        <input className="form-input" value={form.email} onChange={f("email")} />
        <div className="grid-2">
          <div>
            <label className="input-label">Department</label>
            <select className="form-input" value={form.department} onChange={f("department")}>
              {["Development", "HR", "Sales", "Marketing", "Finance", "Operations"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Performance Score</label>
            <input className="form-input" type="number" min="0" max="100" value={form.performanceScore} onChange={f("performanceScore")} />
          </div>
        </div>
        <label className="input-label">Experience (years)</label>
        <input className="form-input" type="number" value={form.experience} onChange={f("experience")} />
        <label className="input-label">Skills (comma-separated)</label>
        <input className="form-input" value={form.skills} onChange={f("skills")} />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primary" onClick={save}>Save Changes</button>
          <button className="btn-primary" style={{ backgroundColor: "#666" }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}