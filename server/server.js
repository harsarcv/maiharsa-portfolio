
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pool = require("./db");
const projectRoutes = require("./routes/projects");
const aboutRoutes = require("./routes/about");
const furokidzRoutes = require("./routes/furokidz");
const contactRoutes = require("./routes/contact");
const cvRoutes = require("./routes/cv");
const adminRoutes = require("./routes/admin");

const app = express();

// Security middleware
app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const cookieSession = require("cookie-session");

app.set("trust proxy", 1);

app.use(
    cookieSession({
        name: "admin_session",
        keys: [process.env.SESSION_SECRET],
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    })
);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));
app.use("/api/about", aboutRoutes);
app.use("/api/furokidz", furokidzRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/cv", cvRoutes);

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Maiharsa Portfolio API",
        status: "running",
    });
});

// Health check + database connection
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

// Projects API
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Endpoint tidak ditemukan",
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err.message);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        message: "Terjadi kesalahan pada server",
    });
});

// Local server entrypoint; exporting app also allows a serverless adapter to import it.
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
