require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

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


// ======================================================
// ================= SUPABASE HELPERS ===================
// ======================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

function isMissingColumnError(error, columnName) {
  const text = String(error?.message || "") + " " + String(error?.details || "");
  const target = String(columnName || "").toLowerCase();
  return text.toLowerCase().includes(`column "${target}"`)
    || text.toLowerCase().includes(`'${target}'`);
}

async function upsertUserProfile(payload) {
  const primary = await supabase
    .from("user_profiles")
    .upsert(payload, { onConflict: "email" })
    .select("id, email, full_name, phone, address")
    .single();

  if (!primary.error) return primary;

  const missingPhone = isMissingColumnError(primary.error, "phone");
  const missingAddress = isMissingColumnError(primary.error, "address");

  if (!missingPhone && !missingAddress) return primary;

  const minimalPayload = {
    full_name: payload.full_name,
    email: payload.email
  };

  return await supabase
    .from("user_profiles")
    .upsert(minimalPayload, { onConflict: "email" })
    .select("id, email, full_name")
    .single();
}

async function insertOrderWithFallback(orderPayload) {
  const primary = await supabase.from("orders").insert(orderPayload);
  if (!primary.error) return primary;

  const minimalOrderPayload = {
    customer_name: orderPayload.customer_name,
    customer_email: orderPayload.customer_email,
    items_json: orderPayload.items_json,
    total_amount: orderPayload.total_amount
  };

  return await supabase.from("orders").insert(minimalOrderPayload);
}


// ======================================================
// ================== SIGN-IN ROUTE =====================
// ======================================================

app.post("/signin", async (req, res) => {
  try {
    const { name, email, phone, address } = req.body || {};

    if (!name || !email || !phone || !address) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        message: "Supabase server credentials are not configured"
      });
    }

    const payload = {
      full_name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      address: String(address).trim()
    };

    const { data, error } = await upsertUserProfile(payload);

    if (error) {
      console.error("Sign-in save error:", error);
      return res.status(500).json({ success: false, message: error.message || "Unable to save user profile" });
    }

    return res.json({ success: true, user_id: data?.id || null, profile: data || null });
  } catch (error) {
    console.error("/signin error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// ======================================================
// =================== ORDER ROUTE ======================
// ======================================================

app.post("/order", async (req, res) => {
  try {
    const { user, cart, total, payment_method, payment_details } = req.body || {};

    if (!user || !Array.isArray(cart) || !cart.length || !Number(total)) {
      return res.status(400).json({ success: false, message: "Invalid order payload" });
    }

    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: "Supabase server credentials are not configured"
      });
    }

    const orderPayload = {
      customer_name: user?.name || null,
      customer_email: user?.email || null,
      customer_phone: user?.phone || null,
      customer_address: user?.address || null,
      items_json: cart,
      total_amount: Number(total),
      payment_method: payment_method || null,
      payment_details: payment_details || null
    };

    const { error } = await insertOrderWithFallback(orderPayload);

    if (error) {
      console.error("Order save error:", error);
      return res.status(500).json({ success: false, message: error.message || "Unable to save order" });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("/order error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


// ================== START SERVER ==================

const PORT = process.env.PORT || 3000;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ Supabase credentials missing. /signin and /order writes will fail.");
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
