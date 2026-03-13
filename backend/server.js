// server.js — single file approach
require("dotenv").config();
// Add this temporarily
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const urlRoutes = require("./src/routes/url.routes");
const { redirectUrl } = require("./src/controllers/url.controller");

// app.use(cors({
//   origin: "http://localhost:4200",  // ← allow Angular app
//   methods: ["GET", "POST", "PATCH", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);
app.get("/:code", redirectUrl);

// ✅ 404 Handler — add this at the very bottom!
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});
// Start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});