// ============================================================
//  server.js  –  AI Employee Performance Analytics Backend
//  Single-file Express + MongoDB + JWT + bcrypt
//  Run: npm install express mongoose bcryptjs jsonwebtoken cors dotenv
//        node server.js
// ============================================================

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/employee_ai";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const PORT = process.env.PORT || 5000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

// ─── DB Connect ───────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── Schemas ──────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
});

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    skills: { type: [String], default: [] },
    performanceScore: { type: Number, required: true, min: 0, max: 100 },
    experience: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Employee = mongoose.model("Employee", EmployeeSchema);

// ─── Auth Middleware ───────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token." });
  }
};

// ─── Error Middleware ──────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 11000) return res.status(400).json({ error: "Duplicate email. Already exists." });
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }
  res.status(500).json({ error: "Internal server error." });
};

// ─── Auth Routes ───────────────────────────────────────────────

// POST /api/auth/signup
app.post("/api/auth/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password are required." });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required." });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials." });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials." });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// ─── Employee Routes (Protected) ──────────────────────────────

// POST /api/employees – Add employee
app.post("/api/employees", auth, async (req, res, next) => {
  try {
    const { name, email, department, skills, performanceScore, experience } = req.body;
    if (!name || !email || !department || performanceScore == null || experience == null)
      return res.status(400).json({ error: "Missing required fields." });
    const emp = await Employee.create({ name, email, department, skills, performanceScore, experience });
    res.status(201).json(emp);
  } catch (err) {
    next(err);
  }
});

// GET /api/employees – Get all employees
app.get("/api/employees", auth, async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ performanceScore: -1 });
    res.json(employees);
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/search?department=X&name=Y – Search/filter
app.get("/api/employees/search", auth, async (req, res, next) => {
  try {
    const { department, name } = req.query;
    const query = {};
    if (department) query.department = { $regex: department, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };
    const employees = await Employee.find(query).sort({ performanceScore: -1 });
    res.json(employees);
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/:id
app.get("/api/employees/:id", auth, async (req, res, next) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found." });
    res.json(emp);
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id – Update employee
app.put("/api/employees/:id", auth, async (req, res, next) => {
  try {
    const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!emp) return res.status(404).json({ error: "Employee not found." });
    res.json(emp);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/employees/:id
app.delete("/api/employees/:id", auth, async (req, res, next) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found." });
    res.json({ message: "Employee deleted successfully." });
  } catch (err) {
    next(err);
  }
});

// ─── AI Route ─────────────────────────────────────────────────

// POST /api/ai/recommend  –  AI recommendation for one or many employees
app.post("/api/ai/recommend", auth, async (req, res, next) => {
  try {
    const { employees } = req.body; // array of employee objects
    if (!employees || !employees.length)
      return res.status(400).json({ error: "Provide at least one employee." });

    const prompt = `You are an expert HR analyst. Analyze the following employee data and provide:
1. Promotion recommendation (Yes/No with reason)
2. Training suggestions (specific skills to develop)
3. AI Feedback (motivational and constructive)
4. Ranking among peers if multiple employees provided

Employee Data:
${JSON.stringify(employees, null, 2)}

Respond ONLY in this JSON format (no markdown):
{
  "rankings": [{"name": "...", "rank": 1, "score": 85}],
  "recommendations": [
    {
      "name": "...",
      "promotion": {"eligible": true, "reason": "..."},
      "training": ["skill1", "skill2"],
      "feedback": "...",
      "overallRating": "Excellent/Good/Needs Improvement"
    }
  ]
}`;

    // Use OpenRouter (OpenAI-compatible) if key is set, else fallback message
    if (!OPENROUTER_API_KEY) {
      return res.json({
        rankings: employees.map((e, i) => ({ name: e.name, rank: i + 1, score: e.performanceScore })),
        recommendations: employees.map((e) => ({
          name: e.name,
          promotion: {
            eligible: e.performanceScore >= 75,
            reason: e.performanceScore >= 75 ? "Strong performance score." : "Needs improvement first.",
          },
          training: e.performanceScore < 70 ? ["Communication", "Time Management"] : ["Leadership", "Advanced " + (e.skills[0] || "skills")],
          feedback: `${e.name} has a performance score of ${e.performanceScore}. ${e.performanceScore >= 75 ? "Keep up the great work!" : "Focus on skill development."}`,
          overallRating: e.performanceScore >= 85 ? "Excellent" : e.performanceScore >= 65 ? "Good" : "Needs Improvement",
        })),
        note: "⚠️ AI API key not configured. Showing rule-based recommendations. Set OPENROUTER_API_KEY in .env for real AI.",
      });
    }

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
      }),
    });

    const aiData = await aiRes.json();
    const text = aiData.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "✅ API running", version: "1.0" }));

// ─── Error handler (must be last) ─────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
