const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const auth = require("../middleware/authMiddleware");

// POST /api/employees – Add employee
router.post("/", auth, async (req, res, next) => {
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
router.get("/", auth, async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ performanceScore: -1 });
    res.json(employees);
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/search – Search/filter
router.get("/search", auth, async (req, res, next) => {
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
router.get("/:id", auth, async (req, res, next) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found." });
    res.json(emp);
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id – Update employee
router.put("/:id", auth, async (req, res, next) => {
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
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ error: "Employee not found." });
    res.json({ message: "Employee deleted successfully." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;