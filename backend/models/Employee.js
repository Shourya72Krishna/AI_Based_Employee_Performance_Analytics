const mongoose = require("mongoose");

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

module.exports = mongoose.model("Employee", EmployeeSchema);