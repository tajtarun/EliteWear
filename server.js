require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());


// ================== MULTER ==================

const storage = multer.memoryStorage();
const upload = multer({ storage });


// ================== ROOT ROUTE ==================

app.get("/", (req, res) => {
  res.send("EliteWear Backend Running ✅");
});


// ======================================================
// ================== CONTACT ROUTE =====================
// ======================================================

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false });
    }

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "EliteWear",
          email: process.env.SENDER_EMAIL,
        },
        to: [{ email: process.env.RECEIVER_EMAIL }],
        subject: "✨ New Contact Message",
        htmlContent: `
          <div style="font-family:Arial;padding:20px;">
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong><br>${message}</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true });

  } catch (error) {
    console.error("Contact Error:", error.response?.data || error.message);
    res.status(500).json({ success: false });
  }
});


// ======================================================
// ============ CONSIGNMENT (MULTI-ITEM) ROUTE =========
// ======================================================

app.post("/submit-consignment", upload.array("files"), async (req, res) => {
  try {
    console.log("Consignment route hit");

    const files = req.files;

    // Accept both names[] and names (for safety)
    const names = req.body["names[]"] || req.body.names;
    const prices = req.body["prices[]"] || req.body.prices;

    console.log("BODY:", req.body);
    console.log("FILES COUNT:", files?.length);

    // ===== VALIDATION =====

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    if (!names || !prices) {
      return res.status(400).json({
        success: false,
        message: "Missing product names or prices"
      });
    }

    // Normalize to arrays
    const nameArray = Array.isArray(names) ? names : [names];
    const priceArray = Array.isArray(prices) ? prices : [prices];

    if (nameArray.length !== priceArray.length) {
      return res.status(400).json({
        success: false,
        message: "Mismatch between names and prices"
      });
    }

    // ===== BUILD EMAIL CONTENT =====

    let htmlContent = `
      <div style="font-family:Arial;padding:20px;">
        <h2>New Consignment Submission</h2>
    `;

    nameArray.forEach((name, index) => {
      htmlContent += `
        <p><strong>Product ${index + 1}</strong></p>
        <p>Name: ${name}</p>
        <p>Price: ₹ ${priceArray[index]}</p>
        <hr/>
      `;
    });

    htmlContent += `</div>`;

    const attachments = files.map(file => ({
      content: file.buffer.toString("base64"),
      name: file.originalname
    }));

    // ===== SEND TO BREVO =====

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "EliteWear",
          email: process.env.SENDER_EMAIL,
        },
        to: [{ email: process.env.RECEIVER_EMAIL }],
        subject: "📦 New Consignment Submission",
        htmlContent: htmlContent,
        attachment: attachments,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent successfully ✅");

    res.json({ success: true });

  } catch (error) {
    console.error("Consignment Error:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});


// ================== START SERVER ==================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
