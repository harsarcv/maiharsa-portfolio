const express = require("express");
const cookieSession = require("cookie-session");
const pool = require("../db");
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// LOGIN ADMIN
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      message: "Username atau password salah",
    });
  }

  req.session.isAdmin = true;

  res.json({ message: "Login berhasil" });
});

// LOGOUT ADMIN
router.post("/logout", adminAuth, (req, res) => {
  req.session = null;
  res.json({ message: "Logout berhasil" });
});

// CEK STATUS LOGIN
router.get("/me", adminAuth, (req, res) => {
  res.json({ isAdmin: true });
});

// UPLOAD GAMBAR KE CLOUDINARY
router.post("/upload", adminAuth, (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Pilih gambar terlebih dahulu" });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "portfolio/projects" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      res.json({ imageUrl: result.secure_url });
    } catch (error) {
      next(error);
    }
  });
});
// TAMBAH PROYEK
router.post("/projects", adminAuth, async (req, res, next) => {
  try {
    const {
      title, slug, main_category, sub_category, description, role,
      tools = [], thumbnail_url, media_urls = [], video_embed_url,
      project_year, is_featured = false, display_order = 0,
    } = req.body;

    if (!title || !slug || !main_category) {
      return res.status(400).json({
        message: "Title, slug, dan main_category wajib diisi",
      });
    }

    const result = await pool.query(
      `INSERT INTO projects
      (title, slug, main_category, sub_category, description, role,
       tools, thumbnail_url, media_urls, video_embed_url, project_year,
       is_featured, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        title, slug, main_category, sub_category || null,
        description || null, role || null, tools, thumbnail_url || null,
        media_urls, video_embed_url || null, project_year || null,
        is_featured, display_order,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// EDIT PROYEK
router.put("/projects/:id", adminAuth, async (req, res, next) => {
  try {
    const fields = [
      "title", "slug", "main_category", "sub_category", "description",
      "role", "tools", "thumbnail_url", "media_urls", "video_embed_url",
      "project_year", "is_featured", "display_order",
    ];

    const entries = Object.entries(req.body).filter(([key]) =>
      fields.includes(key)
    );

    if (!entries.length) {
      return res.status(400).json({ message: "Tidak ada data untuk diubah" });
    }

    const values = entries.map(([, value]) => value);
    const setClause = entries
      .map(([key], index) => `"${key}" = $${index + 1}`)
      .join(", ");

    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE projects SET ${setClause}
       WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Proyek tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// HAPUS PROYEK
router.delete("/projects/:id", adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Proyek tidak ditemukan" });
    }

    res.json({ message: "Proyek berhasil dihapus" });
  } catch (error) {
    next(error);
  }
});


/* =========================================
   EXPERIENCE & ORGANIZATION
========================================= */


router.get("/experiences", adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, organization, role_title, exp_type,
              period, description, highlights, display_order
       FROM experiences
       ORDER BY display_order ASC, id DESC`
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// TAMBAH PENGALAMAN
router.post("/experiences", adminAuth, async (req, res, next) => {
  try {
    const {
      organization,
      role_title,
      exp_type,
      period,
      description,
      highlights = [],
      display_order = 0,
    } = req.body;

    if (
      !organization?.trim() ||
      !role_title?.trim() ||
      !exp_type?.trim() ||
      !period?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        message: "Organisasi, posisi, tipe, periode, dan deskripsi wajib diisi.",
      });
    }

    if (!Array.isArray(highlights)) {
      return res.status(400).json({
        message: "Highlights harus berupa daftar.",
      });
    }

    const result = await pool.query(
      `INSERT INTO experiences
       (organization, role_title, exp_type, period, description, highlights, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        organization.trim(),
        role_title.trim(),
        exp_type.trim(),
        period.trim(),
        description.trim(),
        highlights,
        Number(display_order) || 0,
      ]
    );

    res.status(201).json({
      message: "Pengalaman berhasil ditambahkan.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// EDIT PENGALAMAN
router.put("/experiences/:id", adminAuth, async (req, res, next) => {
  try {
    const fields = [
      "organization",
      "role_title",
      "exp_type",
      "period",
      "description",
      "highlights",
      "display_order",
    ];

    const entries = Object.entries(req.body).filter(([key]) =>
      fields.includes(key)
    );

    if (!entries.length) {
      return res.status(400).json({
        message: "Tidak ada data untuk diubah.",
      });
    }

    if (
      entries.some(
        ([key, value]) =>
          ["organization", "role_title", "exp_type", "period", "description"].includes(key) &&
          (typeof value !== "string" || !value.trim())
      )
    ) {
      return res.status(400).json({
        message: "Field wajib tidak boleh kosong.",
      });
    }

    if (
      entries.some(
        ([key, value]) => key === "highlights" && !Array.isArray(value)
      )
    ) {
      return res.status(400).json({
        message: "Highlights harus berupa daftar.",
      });
    }

    const values = entries.map(([key, value]) =>
      typeof value === "string" ? value.trim() : value
    );

    const setClause = entries
      .map(([key], index) => `"${key}" = $${index + 1}`)
      .join(", ");

    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE experiences
       SET ${setClause}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Pengalaman tidak ditemukan.",
      });
    }

    res.json({
      message: "Pengalaman berhasil diperbarui.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// HAPUS PENGALAMAN
router.delete("/experiences/:id", adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM experiences WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Pengalaman tidak ditemukan.",
      });
    }

    res.json({
      message: "Pengalaman berhasil dihapus.",
    });
  } catch (error) {
    next(error);
  }
});

// GET daftar konten Furokidz
router.get("/furokidz", adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM furokidz_highlights
       ORDER BY display_order ASC, id DESC`
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// TAMBAH konten Furokidz
router.post("/furokidz", adminAuth, async (req, res, next) => {
  try {
    const {
      title, platform, content_url, thumbnail_url,
      views_count, published_at, display_order = 0,
    } = req.body;

    if (!title || !platform || !content_url || !thumbnail_url) {
      return res.status(400).json({
        message: "Judul, platform, URL konten, dan thumbnail wajib diisi",
      });
    }

    const result = await pool.query(
      `INSERT INTO furokidz_highlights
       (title, platform, content_url, thumbnail_url,
        views_count, published_at, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title, platform, content_url, thumbnail_url,
        views_count || null, published_at || null,
        Number(display_order) || 0,
      ]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// EDIT konten Furokidz
router.put("/furokidz/:id", adminAuth, async (req, res, next) => {
  try {
    const {
      title, platform, content_url, thumbnail_url,
      views_count, published_at, display_order = 0,
    } = req.body;

    if (!title || !platform || !content_url || !thumbnail_url) {
      return res.status(400).json({
        message: "Judul, platform, URL konten, dan thumbnail wajib diisi",
      });
    }

    const result = await pool.query(
      `UPDATE furokidz_highlights
       SET title = $1, platform = $2, content_url = $3,
           thumbnail_url = $4, views_count = $5,
           published_at = $6, display_order = $7
       WHERE id = $8
       RETURNING *`,
      [
        title, platform, content_url, thumbnail_url,
        views_count || null, published_at || null,
        Number(display_order) || 0, req.params.id,
      ]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Konten tidak ditemukan" });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// HAPUS konten Furokidz
router.delete("/furokidz/:id", adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM furokidz_highlights WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: "Konten tidak ditemukan" });
    }

    res.json({ message: "Konten Furokidz berhasil dihapus" });
  } catch (error) {
    next(error);
  }
});


/* =========================================
   CONTACT INBOX
========================================= */

// Ambil semua pesan masuk
router.get("/contact-messages", adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, sender_name, sender_email, inquiry_type,
              message, is_read, submitted_at
       FROM contact_messages
       ORDER BY submitted_at DESC`
    );

    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

// Tandai pesan sudah dibaca
router.patch("/contact-messages/:id/read", adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE contact_messages
       SET is_read = TRUE
       WHERE id = $1
       RETURNING id, is_read`,
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Pesan tidak ditemukan.",
      });
    }

    res.json({
      message: "Pesan ditandai sudah dibaca.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// Tandai pesan belum dibaca
router.patch("/contact-messages/:id/unread", adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE contact_messages
       SET is_read = FALSE
       WHERE id = $1
       RETURNING id, is_read`,
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Pesan tidak ditemukan.",
      });
    }

    res.json({
      message: "Pesan ditandai belum dibaca.",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// Hapus pesan
router.delete("/contact-messages/:id", adminAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `DELETE FROM contact_messages
       WHERE id = $1
       RETURNING id`,
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Pesan tidak ditemukan.",
      });
    }

    res.json({ message: "Pesan berhasil dihapus." });
  } catch (error) {
    next(error);
  }
});


module.exports = router;