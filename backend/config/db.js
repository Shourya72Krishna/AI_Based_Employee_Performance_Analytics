const mongoose = require("mongoose");

const connectDB = (uri) => {
  return mongoose
    .connect(uri)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB error:", err));
};

module.exports = connectDB;