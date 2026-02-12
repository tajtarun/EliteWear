require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

// ================= MULTER SETUP =================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.send("EliteWear Backend Running ✅");
});


// ======================================================
// ================= CONTACT ROUTE ======================
// ======================================================

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

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
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong><br>${message}</p>
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
// =============== CONSIGNMENT ROUTE ====================
// ======================================================

app.post("/submit-consignment", upload.single("image"), async (req, res) => {
  try {
    console.log("Consignment route hit");

    const { productName, productPrice } = req.body;
    const file = req.file;

    if (!file || !productName || !productPrice) {
      return res.status(400).json({ success: false });
    }

    const htmlContent = `
      <div style="font-family:Arial;padding:20px;">
        <h2>New Consignment Submission</h2>
        <p><strong>Product Name:</strong> ${productName}</p>
        <p><strong>Product Price:</strong> ₹ ${productPrice}</p>
        <p>Image attached below.</p>
      </div>
    `;

    const attachment = [{
      content: file.buffer.toString("base64"),
      name: file.originalname
    }];

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
        attachment: attachment,
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
    console.error("Consignment Error:", error.response?.data || error.message);
    res.status(500).json({ success: false });
  }
});


// ================= START SERVER =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
