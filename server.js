// ================= Imports =================
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

// ================= App =================
const app = express();

app.use(cors());
app.use(express.json());

// ================= PORT =================
const PORT = process.env.PORT || 3000;

// ================= Email (Brevo SMTP) =================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,      // smtp-relay.brevo.com
  port: Number(process.env.EMAIL_PORT), // 587
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,    // Brevo login
    pass: process.env.EMAIL_PASS,    // Brevo SMTP key
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ================= Test Mail Route =================
app.get("/test-mail", async (req, res) => {
  try {
    await transporter.verify();

    await transporter.sendMail({
      from: `"EliteWear" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Email - EliteWear",
      text: "Your Brevo email setup is working!",
    });

    res.json({
      success: true,
      message: "Test email sent successfully!",
    });

  } catch (error) {
    console.error("Mail Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ================= Contact Form Route =================
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    await transporter.sendMail({
      from: `"EliteWear" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Contact Form Message",
      html: `
        <h3>New Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (error) {
    console.error("Mail Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ================= Start Server =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
