const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT organization, role_title, exp_type,
              period, description, highlights
       FROM experiences
       ORDER BY display_order ASC`
    );

    res.json({
      data: result.rows,
      count: result.rowCount,
    });
  } catch (err) {
    console.error("Failed to fetch about data:", err.message);

    res.status(500).json({
      message: "Gagal mengambil data pengalaman",
    });
  }
});

module.exports = router;