const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⭐ CORSS FIX — REQUIRED FOR GITHUB PAGES ⭐
app.use(
  cors({
    origin: [
      "https://tajtarun.github.io",
      "https://tajtarun.github.io/EliteWear",
      "http://localhost:5500"
    ],
    methods: ["POST"]
  })
);

// ⭐ Multer File Upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ⭐ Wake-up route
app.get("/", (req, res) => {
  res.send("EliteWear backend is alive.");
});

// ⭐ CONSIGNMENT UPLOAD ROUTE
app.post("/consign", upload.array("images"), async (req, res) => {
  try {
    const files = req.files || [];
    const { names, prices } = req.body;

    // convert JSON strings back to arrays
    const itemNames = JSON.parse(names);
    const itemPrices = JSON.parse(prices);

    let emailHTML = "<h2>New Consignment Submission</h2>";

    itemNames.forEach((n, i) => {
      emailHTML += `<p><strong>${n}</strong> — ₹${itemPrices[i]}</p>`;
    });

    // Email sending
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Consignment Submission",
      html: emailHTML
    });

    res.json({ success: true });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ⭐ Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
