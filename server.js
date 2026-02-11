require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ================= MAIL SETUP =================

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,   // smtp-relay.brevo.com
  port: Number(process.env.EMAIL_PORT), // 587
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER, // Brevo login
    pass: process.env.EMAIL_PASS, // SMTP key
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ================= TEST ROUTE =================

app.get("/test-mail", async (req, res) => {
  try {
    await transporter.verify();

    await transporter.sendMail({
      from: `"EliteWear" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to yourself
      subject: "Brevo Test Mail ✅",
      text: "Email working successfully!",
    });

    res.json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("MAIL ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ================= SERVER =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
