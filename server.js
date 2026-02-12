require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

// ================= MULTER =================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ================= ROOT =================
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
          <div style="font-family:Arial;background:#f4f4f4;padding:30px;">
            <div style="max-width:600px;margin:auto;background:#ffffff;
                        padding:25px;border-radius:12px;
                        box-shadow:0 10px 25px rgba(0,0,0,0.1);">
              
              <h2 style="margin-top:0;border-bottom:2px solid #d4af37;
                         padding-bottom:10px;color:#000;">
                New Contact Message
              </h2>

              <p><strong>Name:</strong><br>${name}</p>
              <p><strong>Email:</strong><br>${email}</p>
              <p><strong>Message:</strong><br>${message}</p>

              <hr style="margin:20px 0;">
              <p style="font-size:12px;color:#777;">
                Sent from EliteWear website contact form.
              </p>
            </div>
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
// =============== CONSIGNMENT ROUTE ====================
// ======================================================

app.post("/submit-consignment", upload.array("files"), async (req, res) => {
  try {
    console.log("Consignment route hit");

    const files = req.files;
    const names = req.body["names[]"];
    const prices = req.body["prices[]"];

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false });
    }

    const nameArray = Array.isArray(names) ? names : [names];
    const priceArray = Array.isArray(prices) ? prices : [prices];

    let htmlContent = `
      <div style="font-family:Arial;background:#f4f4f4;padding:30px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;
                    padding:25px;border-radius:12px;
                    box-shadow:0 10px 25px rgba(0,0,0,0.1);">

          <h2 style="margin-top:0;border-bottom:2px solid #d4af37;
                     padding-bottom:10px;color:#000;">
            New Consignment Submission
          </h2>
    `;

    nameArray.forEach((name, index) => {
      htmlContent += `
        <p>
          <strong>Item ${index + 1}</strong><br>
          Name: ${name}<br>
          Price: ₹ ${priceArray[index]}
        </p>
        <hr>
      `;
    });

    htmlContent += `
          <p style="font-size:12px;color:#777;">
            Images attached below.
          </p>
        </div>
      </div>
    `;

    const attachments = files.map(file => ({
      content: file.buffer.toString("base64"),
      name: file.originalname
    }));

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

    res.json({ success: true });

  } catch (error) {
    console.error("Consignment Error:", error.response?.data || error.message);
    res.status(500).json({ success: false });
  }
});


// ================= SERVER =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
