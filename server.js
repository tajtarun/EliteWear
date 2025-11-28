const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = 5500;  // ✅ SAME port as Live Server

app.use(cors());
app.use(express.json());

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// =============================
// CONSIGNMENT EMAIL ENDPOINT
// =============================
app.post('/submit-consignment', upload.array('files'), async (req, res) => {
    try {
        const files = req.files;
        const names = req.body['names[]'];
        const prices = req.body['prices[]'];

        // Ensure arrays
        const itemNames = Array.isArray(names) ? names : [names];
        const itemPrices = Array.isArray(prices) ? prices : [prices];

        let emailText = "New Consignment Submission:\n\n";

        for (let i = 0; i < itemNames.length; i++) {
            emailText += `Item ${i + 1}:\n`;
            emailText += `Name: ${itemNames[i] || "Not provided"}\n`;
            emailText += `Price: ₹${itemPrices[i] || "Not provided"}\n\n`;
        }

        // Attach uploaded images
        let attachments = [];
        if (files) {
            attachments = files.map((file, i) => ({
                filename: file.originalname || `item${i + 1}.jpg`,
                content: file.buffer
            }));
        }

        // Configure Gmail
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "jtarunhyd@gmail.com",
                pass: "wseb nome mslo ovdo"   // Your Gmail App Password
            }
        });

        // Email settings
        const mailOptions = {
            from: "jtarunhyd@gmail.com",
            to: "jtarunhyd@gmail.com",
            subject: "New Consignment Submission",
            text: emailText,
            attachments: attachments
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Email sent successfully!" });

    } catch (err) {
        console.error("Email Error:", err);
        return res.status(500).json({ success: false, error: String(err) });
    }
});

// Start server on port 5500
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
