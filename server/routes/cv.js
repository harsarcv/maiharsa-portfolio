
const express = require("express");
const path = require("path");
const fs = require("fs");
const pool = require("../db");

const router = express.Router();

const cvPath = path.join(__dirname, "..", "public", "cv.pdf");

router.get("/download", async (req, res) => {
  try {
    // Pastikan file CV tersedia
    if (!fs.existsSync(cvPath)) {
      return res.status(404).json({
        message: "File CV belum tersedia.",
      });
    }

    // Catat unduhan ke database
    try {
      await pool.query(
        `INSERT INTO cv_download_logs (user_agent, referrer)
         VALUES ($1, $2)`,
        [
          typeof req.get("user-agent") === "string"
            ? req.get("user-agent").slice(0, 1000)
            : null,
          typeof req.get("referer") === "string"
            ? req.get("referer").slice(0, 2000)
            : null,
        ]
      );
    } catch (err) {
      // Kegagalan pencatatan tidak membocorkan detail database
      console.error("Failed to record CV download.");
    }

    // Kirim file PDF
    return res.download(cvPath, "Maiharsa-Muara-CV.pdf", (err) => {
      if (err && !res.headersSent) {
        console.error("Failed to send CV file.");
        res.status(500).json({
          message: "Gagal mengirim file CV.",
        });
      }
    });
  } catch (err) {
    console.error("CV download failed.");

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Terjadi kesalahan saat mengunduh CV.",
      });
    }
  }
});

module.exports = router;
