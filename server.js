require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

const app = express();

/* ================= Middleware ================= */

app.use(cors());
app.use(express.json());

/* ================= Supabase ================= */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/* ================= File Upload ================= */

const upload = multer({
  storage: multer.memoryStorage(),
});

/* ================= Email (SMTP) ================= */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
});

/* ================= Test SMTP ================= */

transporter.verify((err, success) => {
  if (err) {
    console.log("❌ SMTP Error:", err.message);
  } else {
    console.log("✅ SMTP Ready");
  }
});

/* ================= Routes ================= */

// Home
app.get("/", (req, res) => {
  res.send("EliteWear Backend Running ✅");
});

// Test Mail (IMPORTANT)
app.get("/test-mail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email - EliteWear",
      text: "If you received this, SMTP is working ✅",
    });

    res.json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (err) {
    console.error("Mail Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Contact Form
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Contact Form",
      text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `,
    });

    res.json({
      success: true,
      message: "Email sent successfully ✅",
    });
  } catch (err) {
    console.error("Contact Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Consignment Upload
app.post("/consign", upload.single("image"), async (req, res) => {
  const { name, price } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      error: "No file uploaded",
    });
  }

  try {
    const fileName = `${Date.now()}_${file.originalname}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Consignment",
      text: `
Product: ${name}
Price: ${price}
File: ${fileName}
      `,
    });

    res.json({
      success: true,
      message: "Consignment sent successfully",
    });
  } catch (err) {
    console.error("Consign Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* ================= Start Server ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
