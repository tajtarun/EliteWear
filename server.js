require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// ================== TEST ROUTE ==================
app.get("/", (req, res) => {
  res.send("EliteWear Backend Running ✅");
});

// ================== SEND MAIL (BREVO API) ==================
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "EliteWear",
          email: process.env.SENDER_EMAIL,
        },

        to: [
          {
            email: process.env.RECEIVER_EMAIL,
            name: "Admin",
          },
        ],

        subject: "New Contact Form Message",

        htmlContent: `
          <h3>New Message</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log("Mail sent:", response.data);

    res.json({
      success: true,
      message: "Email sent using Brevo API",
      data: response.data,
    });
  } catch (error) {
    console.error("Mail Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: "Email sending failed",
    });
  }
});

// ================== SERVER ==================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
