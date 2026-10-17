
const express = require("express");
const rateLimit = require("express-rate-limit");
const pool = require("../db");

const router = express.Router();

// Batasi pengiriman pesan: 5 permintaan per 15 menit per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Terlalu banyak percobaan. Silakan coba lagi nanti.",
  },
});

const allowedInquiryTypes = [
  "Recruitment",
  "3D Project",
  "Video Production",
  "Photography",
  "Other",
];

router.post("/", contactLimiter, async (req, res) => {
  try {
    const { sender_name, sender_email, inquiry_type, message } = req.body;

    // Validasi field wajib
    if (
      typeof sender_name !== "string" ||
      typeof sender_email !== "string" ||
      typeof inquiry_type !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        message: "Semua field wajib diisi dengan format yang benar.",
      });
    }

    const name = sender_name.trim();
    const email = sender_email.trim();
    const inquiryType = inquiry_type.trim();
    const messageText = message.trim();

    if (!name || !email || !inquiryType || !messageText) {
      return res.status(400).json({
        message: "Semua field wajib diisi.",
      });
    }

    if (name.length > 120) {
      return res.status(400).json({
        message: "Nama maksimal 120 karakter.",
      });
    }

    if (email.length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Format email tidak valid.",
      });
    }

    if (!allowedInquiryTypes.includes(inquiryType)) {
      return res.status(400).json({
        message: "Jenis permintaan tidak valid.",
      });
    }

    if (messageText.length > 5000) {
      return res.status(400).json({
        message: "Pesan maksimal 5000 karakter.",
      });
    }

    const result = await pool.query(
      `INSERT INTO contact_messages
        (sender_name, sender_email, inquiry_type, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, submitted_at`,
      [name, email, inquiryType, messageText]
    );

    return res.status(201).json({
      message: "Pesan berhasil dikirim.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Failed to save contact message:", err.message);

    return res.status(500).json({
      message: "Pesan gagal disimpan. Silakan coba lagi nanti.",
    });
  }
});

module.exports = router;
