require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// ================= SEND MAIL USING BREVO API =================

app.get("/test-mail", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "EliteWear",
          email: "no-reply@elitewear.com", // any email
        },
        to: [
          {
            email: process.env.EMAIL_USER, // your email
          },
        ],
        subject: "Brevo API Test ✅",
        htmlContent: "<h2>Email Working Successfully!</h2>",
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      message: "Email sent using Brevo API",
      data: response.data,
    });

  } catch (error) {
    console.error("API MAIL ERROR:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

// ================= SERVER =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
