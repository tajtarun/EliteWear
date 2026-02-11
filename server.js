require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
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

/* ================= Email (Brevo SMTP) ================= */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // smtp-relay.brevo.com
  port: Number(process.env.SMTP_PORT),  // 587
  secure: false,                       // must be false for 587
  auth: {
    user: process.env.SMTP_USER,       // Brevo login
    pass: process.env.SMTP_PASS,       // SMTP key
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

/* ================= Check SMTP ================= */

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Error:", error);
  } else {
    console.log("✅ SMTP Ready");
  }
});

/* ================= Routes ================= */

// Health check
app.get("/", (req, res) => {
  res.send("EliteWear Backend Running ✅");
});

// Test mail route
app.get("/test-mail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"EliteWear" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "Test Mail - EliteWear",
      text: "This is a test email from EliteWear backend.",
    });

    res.json({ success: true, message: "Test email sent ✅" });
  } catch (err) {
    console.error("Mail Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Contact form
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"EliteWear" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "New Contact Form",
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    res.json({ success: true, message: "Email sent ✅" });
  } catch (err) {
    console.error("Contact Mail Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Consignment upload
app.post("/consign", upload.single("image"), async (req, res) => {
  const { name, price } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
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
      from: `"EliteWear" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "New Consignment",
      text: `
Product: ${name}
Price: ${price}
File: ${fileName}
      `,
    });

    res.json({ success: true, message: "Consignment submitted ✅" });
  } catch (err) {
    console.error("Consign Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ================= Start Server ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
