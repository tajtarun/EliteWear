// ================= Imports =================
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const SibApiV3Sdk = require("sib_api_v3_sdk");

// ================= Load .env =================
dotenv.config();

// ================= App =================
const app = express();
const PORT = process.env.PORT || 3000;

// ================= Middlewares =================
app.use(cors());
app.use(express.json());

// ================= Brevo Setup =================
const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// ================= Routes =================

// Health check
app.get("/", (req, res) => {
  res.send("EliteWear Backend Running ✅");
});

// Test mail route
app.get("/test-mail", async (req, res) => {
  try {
    const emailData = {
      sender: {
        name: "EliteWear",
        email: process.env.SENDER_EMAIL,
      },

      to: [
        {
          email: process.env.SENDER_EMAIL,
          name: "Admin",
        },
      ],

      subject: "Test Email from EliteWear",

      htmlContent: `
        <h2>Test Email</h2>
        <p>Your Brevo email system is working successfully ✅</p>
      `,
    };

    const result = await emailApi.sendTransacEmail(emailData);

    res.json({
      success: true,
      message: "Test email sent",
      data: result,
    });

  } catch (error) {
    console.error("Mail Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Contact form route
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields required",
      });
    }

    const emailData = {
      sender: {
        name: "EliteWear Website",
        email: process.env.SENDER_EMAIL,
      },

      to: [
        {
          email: process.env.SENDER_EMAIL,
          name: "Admin",
        },
      ],

      replyTo: {
        email: email,
        name: name,
      },

      subject: "New Contact Form Message",

      htmlContent: `
        <h3>New Message</h3>

        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    };

    const result = await emailApi.sendTransacEmail(emailData);

    res.json({
      success: true,
      message: "Email sent successfully",
      data: result,
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
