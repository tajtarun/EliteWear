// server.js  --- FINAL WORKING VERSION FOR RENDER + GITHUB PAGES

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// CORS FIXED FOR GITHUB PAGES
// -----------------------------
app.use(
  cors({
    origin: [
      "https://tajtarun.github.io",
      "https://tajtarun.github.io/EliteWear"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// -----------------------------
// Multer - Handle Image Upload
// -----------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// -----------------------------
// Email Setup
// -----------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -----------------------------
// Main Route
// -----------------------------
app.get("/", (req, res) => {
  res.send("EliteWear backend server is running!");
});

// -----------------------------
// Consignment Upload API
// -----------------------------
app.post("/upload-consignment", upload.array("images"), async (req, res) => {
  try {
    const items = JSON.parse(req.body.items);
    const images = req.files;

    let html = `
      <h2>New Consignment Request</h2>
      <p><strong>Total Items:</strong> ${items.length}</p>
      <hr/>
    `;

    items.forEach((item, i) => {
      html += `
        <h3>Item ${i + 1}</h3>
        <p><strong>Name:</strong> ${item.name}</p>
        <p><strong>Price:</strong> ₹${item.price}</p>
      `;
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: "New Consignment Request",
      html,
      attachments: images.map((file, i) => ({
        filename: `item-${i + 1}.jpg`,
        content: file.buffer,
      })),
    });

    res.json({ success: true, message: "Consignment submitted successfully!" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Try again later.",
    });
  }
});

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
