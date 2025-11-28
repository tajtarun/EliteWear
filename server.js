// server.js
// Backend for EliteWear consignment — ready for Render

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- CORS: allow your GitHub pages + render + localhost for testing ----
const allowedOrigins = [
  "https://tajtvarun.github.io",
  "https://tajtvarun.github.io/EliteWear",
  "http://localhost:5500",             // optional local dev
  "http://127.0.0.1:5500",
  "https://elitewear-backend.onrender.com",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (e.g. curl, server-to-server)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS not allowed"), false);
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// ---- Multer setup: store uploads in memory (safe) ----
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---- Nodemailer transporter (configure env variables on Render) ----
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,      // set on Render
    pass: process.env.EMAIL_PASS,      // set on Render
  },
});

// basic health check / wake-up
app.get("/", (req, res) => {
  res.send("EliteWear backend server is running!");
});

// POST /upload-consignment
// Expects: files[] (images) and "items" JSON string in body (array of { name, price })
// client sends a FormData with files + items (stringified)
app.post("/upload-consignment", upload.array("files"), async (req, res) => {
  try {
    // items may be in req.body.items as JSON string OR names[]/prices[] — we handle both
    let items = [];

    if (req.body.items) {
      try {
        items = JSON.parse(req.body.items);
      } catch (e) {
        // fallback: maybe names[] and prices[] are provided
        items = [];
      }
    }

    // fallback: if items empty but names[] present
    if ((!items || items.length === 0) && req.body["names[]"]) {
      const names = Array.isArray(req.body["names[]"]) ? req.body["names[]"] : [req.body["names[]"]];
      const prices = Array.isArray(req.body["prices[]"]) ? req.body["prices[]"] : [req.body["prices[]"]];
      items = names.map((n, i) => ({ name: n || "", price: prices[i] || "" }));
    }

    const files = req.files || [];

    // build email HTML
    let html = `<h2>New Consignment Request</h2><p><strong>Total items:</strong> ${items.length || files.length}</p><hr/>`;

    items.forEach((it, idx) => {
      html += `<h4>Item ${idx + 1}</h4><p><strong>Name:</strong> ${it.name || "(no name)"}<br/><strong>Price:</strong> ${it.price || "(no price)"}</p>`;
    });

    // Attach uploaded images (if any) to the email
    const attachments = files.map((f, i) => {
      // guess extension from mime-type (simple)
      const ext = (f.mimetype && f.mimetype.split("/")[1]) || "jpg";
      return {
        filename: `item-${i + 1}.${ext}`,
        content: f.buffer,
      };
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: "EliteWear — New consignment submission",
      html,
      attachments,
    };

    // Send email (if transporter configured)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("EMAIL_USER / EMAIL_PASS not set in environment — skipping email send (still returning success)");
    } else {
      await transporter.sendMail(mailOptions);
    }

    // optionally save uploads to /uploads on the server (useful for debugging)
    try {
      if (files.length) {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        files.forEach((f, i) => {
          const ext = (f.mimetype && f.mimetype.split("/")[1]) || "jpg";
          const filename = path.join(uploadDir, `item-${Date.now()}-${i}.${ext}`);
          fs.writeFileSync(filename, f.buffer);
        });
      }
    } catch (err) {
      console.warn("Could not write uploaded files to disk:", err.message);
    }

    return res.json({ success: true, message: "Consignment received." });
  } catch (err) {
    console.error("Error in /upload-consignment:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// Start server — Render uses process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EliteWear backend listening on port ${PORT}`);
});
