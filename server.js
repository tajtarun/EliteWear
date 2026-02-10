require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

/* ================= SUPABASE ================= */

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_ANON_KEY || ""
);

/* ================= FILE UPLOAD ================= */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ================= EMAIL ================= */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

/* ================= TEST EMAIL ================= */

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP Error:", err);
  } else {
    console.log("✅ SMTP Ready");
  }
});

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  res.send("EliteWear Backend Running ✅");
});

/* ===== CONTACT FORM ===== */

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing fields",
      });
    }

    await transporter.sendMail({
      from: `"EliteWear" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "📩 New Contact Form",
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.json({
      success: true,
      message: "Email sent successfully ✅",
    });
  } catch (err) {
    console.error("❌ Contact Error:", err);

    res.status(500).json({
      success: false,
      error: "Connection timeout",
    });
  }
});

/* ===== CONSIGNMENT ===== */

app.post("/consign", upload.single("image"), async (req, res) => {
  try {
    const { name, price } = req.body;
    const file = req.file;

    if (!name || !price || !file) {
      return res.status(400).json({
        success: false,
        error: "Missing data",
      });
    }

    const fileName = `${Date.now()}_${file.originalname}`;

    if (process.env.SUPABASE_URL) {
      const { error } = await supabase.storage
        .from("products")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) throw error;
    }

    await transporter.sendMail({
      from: `"EliteWear" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "📦 New Consignment",
      html: `
        <h3>New Product Submitted</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Price:</b> ₹${price}</p>
        <p><b>File:</b> ${fileName}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Consign Error:", err);

    res.status(500).json({
      success: false,
      error: "Upload failed",
    });
  }
});

/* ================= START ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
