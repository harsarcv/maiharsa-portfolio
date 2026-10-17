const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT title, platform, content_url,
              thumbnail_url, views_count, published_at
       FROM furokidz_highlights
       ORDER BY display_order ASC, published_at DESC`
    );

    res.json({
      data: result.rows,
      count: result.rowCount,
    });
  } catch (err) {
    console.error("Failed to fetch Furokidz data:", err.message);

    res.status(500).json({
      message: "Gagal mengambil data Furokidz",
    });
  }
});

module.exports = router;