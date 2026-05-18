import { useState } from "react";
import "../index.css"; // Explicitly links the unified styling classes

export default function AuthPage({ API, onAuth }) {
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card-layout" style={{ width: 380, marginBottom: 0 }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 36 }}>🏢</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a237e", margin: "8px 0 4px" }}>EmpAI Analytics</h1>
          <p style={{ color: "#888", fontSize: 13 }}>AI-Powered HR Management</p>
        </div>
        <div style={{ display: "flex", marginBottom: "1.5rem", borderRadius: 8, overflow: "hidden", border: "1px solid #e0e0e0" }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`tab-button ${mode === m ? "active" : ""}`} style={{ flex: 1, padding: "9px 0" }}>
              {m === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>
        {err && <div className="alert-error">{err}</div>}
        {mode === "signup" && (
          <>
            <label className="input-label">Full Name</label>
            <input className="form-input" placeholder="Aman Verma" value={form.name} onChange={f("name")} />
          </>
        )}
        <label className="input-label">Email</label>
        <input className="form-input" type="email" placeholder="aman@gmail.com" value={form.email} onChange={f("email")} />
        <label className="input-label">Password</label>
        <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={f("password")}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
        <button className="btn-primary" style={{ width: "100%", padding: "11px" }} onClick={submit} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Login" : "Create Account"}
        </button>
      </div>
    </div>
  );
}