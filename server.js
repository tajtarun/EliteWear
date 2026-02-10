require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Supabase (only if you are using it)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Multer
const upload = multer({ storage: multer.memoryStorage() });

// Gmail Transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Check mail connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Gmail Error:", error);
  } else {
    console.log("✅ Gmail Ready");
  }
});

// Home test
app.get("/", (req, res) => {
  res.send("EliteWear Backend Running ✅");
});

// Contact route
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
    console.error("MAIL ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Consign route
app.post("/consign", upload.single("image"), async (req, res) => {
  const { name, price } = req.body;
  const file = req.file;

  try {
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

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

    res.json({ success: true });
  } catch (err) {
    console.error("CONSIGN ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
