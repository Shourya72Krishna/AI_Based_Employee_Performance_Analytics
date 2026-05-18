const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 11000) return res.status(400).json({ error: "Duplicate email. Already exists." });
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }
  res.status(500).json({ error: "Internal server error." });
};

module.exports = errorHandler;