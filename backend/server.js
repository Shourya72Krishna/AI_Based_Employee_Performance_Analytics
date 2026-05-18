require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/employee_ai";
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB(MONGO_URI);

// Map Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.use("/api", errorHandler); // Direct fallback mounting error handler safely
app.get("/", (req, res) => res.json({ status: "✅ API running", version: "1.0" }));

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));