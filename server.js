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

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Multer (file upload)
const upload = multer({ storage: multer.memoryStorage() });

// Email Transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test route
app.get("/", (req, res) => {
  res.send("EliteWear Backend Running ✅");
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

    res.json({ success: true, message: "Email sent successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Consignment Upload
app.post("/consign", upload.single("image"), async (req, res) => {
  const { name, price } = req.body;
  const file = req.file;

  try {
    // Upload to Supabase storage
    const fileName = `${Date.now()}_${file.originalname}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    // Send Email
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
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
