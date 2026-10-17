
const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/projects
router.get("/", async (req, res) => {
  try {
    const { category, sub, featured } = req.query;

    const conditions = [];
    const values = [];

    if (category) {
      values.push(category);
      conditions.push(`main_category = $${values.length}`);
    }

    if (sub) {
      values.push(sub);
      conditions.push(`sub_category = $${values.length}`);
    }

    if (featured !== undefined) {
      if (!["true", "false"].includes(featured)) {
        return res.status(400).json({
          message: "Parameter featured harus true atau false",
        });
      }

      values.push(featured === "true");
      conditions.push(`is_featured = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `SELECT *
       FROM projects
       ${whereClause}
       ORDER BY display_order ASC, created_at DESC`,
      values
    );

    res.json({
      data: result.rows,
      count: result.rowCount,
    });
  } catch (err) {
    console.error("Failed to fetch projects:", err.message);
    res.status(500).json({
      message: "Gagal mengambil data proyek",
    });
  }
});

// GET /api/projects/:slug
router.get("/:slug", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM projects WHERE slug = $1",
      [req.params.slug]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Proyek tidak ditemukan",
      });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Failed to fetch project:", err.message);
    res.status(500).json({
      message: "Gagal mengambil detail proyek",
    });
  }
});

module.exports = router;
