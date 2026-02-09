require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const app = express();
const upload = multer({ dest: "uploads/" });

// Middleware
app.use(cors());
app.use(express.json());

// Home test
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// ================= CONTACT =================
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Contact Message",
      html: `
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Mail failed" });
  }
});

// ================= CONSIGNMENT =================
app.post("/consignment", upload.single("photo"), async (req, res) => {
  const { productName, price } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Consignment",
      html: `
        <p><b>Product:</b> ${productName}</p>
        <p><b>Price:</b> ₹${price}</p>
      `,
      attachments: [
        {
          filename: req.file.originalname,
          path: req.file.path,
        },
      ],
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ================= ADMIN LOGIN =================
app.post("/admin/login", (req, res) => {
  const { password } = req.body;

  if (password === "admin123") {
    const token = jwt.sign(
      { admin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } else {
    res.status(401).json({ error: "Wrong password" });
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
