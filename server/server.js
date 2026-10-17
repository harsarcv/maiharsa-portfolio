
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieSession = require("cookie-session");
const pool = require("./db");

const projectRoutes = require("./routes/projects");
const aboutRoutes = require("./routes/about");
const furokidzRoutes = require("./routes/furokidz");
const contactRoutes = require("./routes/contact");
const cvRoutes = require("./routes/cv");
const adminRoutes = require("./routes/admin");

const app = express();

// ================================
// SECURITY
// ================================

app.set("trust proxy", 1);
app.use(helmet());

// ================================
// CORS
// ================================

const allowedOrigins = (
  process.env.FRONTEND_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Izinkan request tanpa Origin, misalnya health check server.
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin tidak diizinkan oleh CORS"));
    },
    credentials: true,
  })
);

// ================================
// SESSION
// ================================

app.use(
  cookieSession({
    name: "admin_session",
    keys: [process.env.SESSION_SECRET || "development-only-secret"],
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
  })
);

// ================================
// BODY PARSER
// ================================

app.use(express.json({ limit: "10kb" }));

// ================================
// ROOT
// ================================

app.get("/", (req, res) => {
  res.json({
    message: "Maiharsa Portfolio API",
    status: "running",
  });
});

// ================================
// HEALTH CHECK
// ================================

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (err) {
    console.error("Health check failed:", err.message);

    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// ================================
// API ROUTES
// ================================

app.use("/api/about", aboutRoutes);
app.use("/api/furokidz", furokidzRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);

// ================================
// 404 HANDLER
// ================================

app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint tidak ditemukan",
  });
});

// ================================
// ERROR HANDLER
// ================================

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Origin tidak diizinkan oleh CORS") {
    return res.status(403).json({
      message: "Origin tidak diizinkan oleh CORS",
    });
  }

  res.status(500).json({
    message: "Terjadi kesalahan pada server",
  });
});

// ================================
// LOCAL SERVER
// ================================

let server;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  server = app.listen(PORT, () => {
    console.log(`Maiharsa Portfolio API running at http://localhost:${PORT}`);
  });

  async function shutdown() {
    console.log("Shutting down server...");

    server.close(async () => {
      try {
        await pool.end();
        console.log("Database connection pool closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing database pool:", err.message);
        process.exit(1);
      }
    });
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = app;
