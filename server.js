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

       subject: "New Contact Message",

htmlContent: `
  <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:40px;">
    <div style="
        max-width:600px;
        margin:auto;
        background:#ffffff;
        border-radius:12px;
        padding:30px;
        box-shadow:0 10px 25px rgba(0,0,0,0.1);
    ">
      <h2 style="
          margin-top:0;
          color:#000;
          border-bottom:2px solid #d4af37;
          padding-bottom:10px;
      ">
        ✨ New Contact Message
      </h2>

      <p style="font-size:16px;">
        <strong>Name:</strong><br>
        ${name}
      </p>

      <p style="font-size:16px;">
        <strong>Email:</strong><br>
        ${email}
      </p>

      <p style="font-size:16px;">
        <strong>Message:</strong><br>
        ${message}
      </p>

      <hr style="margin:25px 0;">

      <p style="font-size:13px; color:#777;">
        This message was sent from your EliteWear website contact form.
      </p>
    </div>
  </div>
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
