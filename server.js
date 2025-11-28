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
// CORS (Important for GitHub Pages)
// -----------------------------
app.use(
  cors({
    origin: "https://tajtvarun.github.io", // your GitHub website
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
// Email Setup (Render environment variables required)
// -----------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // set on Render
    pass: process.env.EMAIL_PASS, // set on Render
  },
});

// -----------------------------
// Main Route (Check Server)
// -----------------------------
app.get("/", (req, res) => {
  res.send("EliteWear backend server is running!");
});

// -----------------------------
// Consignment Upload API
// -----------------------------
app.post("/upload-consignment", upload.array("images"), async (req, res) => {
  try {
    const items = JSON.parse(req.body.items); // name + price
    const images = req.files;

    console.log("Received items:", items);

    // -------------------------
    // Create Email HTML
    // -------------------------
    let html = `
      <h2>New Consignment Request</h2>
      <p><strong>Total Items:</strong> ${items.length}</p>
      <hr/>
    `;

    items.forEach((item, index) => {
      html += `
        <h3>Item ${index + 1}</h3>
        <p><strong>Name:</strong> ${item.name}</p>
        <p><strong>Price:</strong> ₹${item.price}</p>
        <br/>
      `;
    });

    // -------------------------
    // Email Options
    // -------------------------
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: "New Consignment Request",
      html,
      attachments: images.map((file, index) => ({
        filename: `item-${index + 1}.jpg`,
        content: file.buffer,
      })),
    };

    // -------------------------
    // Send Email
    // -------------------------
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Consignment submitted successfully!",
    });
  } catch (err) {
    console.error("Error in consignment upload:", err);
    return res.status(500).json({
      success: false,
      message: "Server error. Try again later.",
    });
  }
});

// -----------------------------
// Start Server (Render uses process.env.PORT)
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
