const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⭐ CORS FIX – IMPORTANT ⭐
app.use(
  cors({
    origin: [
      "https://tajtarun.github.io",
      "https://tajtarun.github.io/EliteWear",
      "http://localhost:5500"
    ],
    methods: ["GET", "POST"],
  })
);

// ⭐ Multer File Upload Setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ⭐ Wake-up route
app.get("/", (req, res) => {
  res.send("EliteWear backend alive.");
});

// ⭐ Consignment upload route
app.post("/consign", upload.array("images"), async (req, res) => {
  try {
    const { products } = req.body;

    if (!products) {
      return res.status(400).json({ error: "No product data received" });
    }

    const parsedProducts = JSON.parse(products);

    let html = "<h2>New Consignment Submission</h2>";
    parsedProducts.forEach((p, i) => {
      html += `
        <h3>Item ${i + 1}</h3>
        <p><strong>Name:</strong> ${p.name}</p>
        <p><strong>Price:</strong> ₹${p.price}</p>
      `;
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Consignment Item Submitted",
      html,
      attachments: req.files.map((file, index) => ({
        filename: `item${index + 1}.jpg`,
        content: file.buffer,
      })),
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
