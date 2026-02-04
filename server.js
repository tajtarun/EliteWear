require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ================= DATA FILES ================= */

const PRODUCTS_FILE = "./data/products.json";
const ORDERS_FILE = "./data/orders.json";

/* ================= CREATE FOLDERS ================= */

if (!fs.existsSync("data")) fs.mkdirSync("data");
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

if (!fs.existsSync(PRODUCTS_FILE))
  fs.writeFileSync(PRODUCTS_FILE, "[]");

if (!fs.existsSync(ORDERS_FILE))
  fs.writeFileSync(ORDERS_FILE, "[]");

/* ================= FILE UPLOAD ================= */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage });

/* ================= MAIL CONFIG ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* Verify Gmail */
transporter.verify((err, success) => {
  if (err) {
    console.log("❌ MAIL ERROR:", err);
  } else {
    console.log("✅ MAIL SERVER READY");
  }
});

/* ================= HELPERS ================= */

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ================= ADMIN ================= */

app.post("/api/admin/add-product", upload.single("image"), (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ success: false });
    }

    const { name, price } = req.body;
    const image = req.file.filename;

    const products = readJSON(PRODUCTS_FILE);

    products.push({
      id: Date.now(),
      name,
      price,
      image
    });

    writeJSON(PRODUCTS_FILE, products);

    console.log("✅ Product Added:", name);

    res.json({ success: true });

  } catch (err) {
    console.log("❌ Admin Error:", err);
    res.status(500).json({ success: false });
  }
});

/* ================= PRODUCTS ================= */

app.get("/api/products", (req, res) => {
  res.json(readJSON(PRODUCTS_FILE));
});

/* ================= ORDER ================= */

app.post("/api/order", async (req, res) => {

  try {

    const { user, cart, total } = req.body;

    const orders = readJSON(ORDERS_FILE);

    orders.push({
      id: Date.now(),
      user,
      cart,
      total,
      date: new Date()
    });

    writeJSON(ORDERS_FILE, orders);

    let itemsHTML = "";

    cart.forEach(item => {
      itemsHTML += `
        <p>
          <b>${item.name}</b><br>
          Price: ₹${item.price}<br>
          Qty: ${item.qty}
        </p>
        <hr>
      `;
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🛒 New Order - EliteWear",
      html: `
        <h2>New Order</h2>

        <p>
          Name: ${user.name}<br>
          Email: ${user.email}<br>
          Phone: ${user.phone}<br>
          Address: ${user.address}
        </p>

        ${itemsHTML}

        <h3>Total: ₹${total}</h3>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Order Mail Sent");

    res.json({ success: true });

  } catch (err) {
    console.log("❌ Order Error:", err);
    res.status(500).json({ success: false });
  }
});

/* ================= CONSIGNMENT ================= */

app.post("/api/consignment", upload.single("image"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({ success: false });
    }

    const { name, price } = req.body;
    const image = req.file.filename;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "📦 New Consignment",
      html: `
        <h2>Consignment</h2>

        <p>Name: ${name}</p>
        <p>Price: ₹${price}</p>

        <img src="cid:img"/>
      `,
      attachments: [
        {
          filename: image,
          path: "./uploads/" + image,
          cid: "img"
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Consignment Mail Sent");

    res.json({ success: true });

  } catch (err) {
    console.log("❌ Consignment Error:", err);
    res.status(500).json({ success: false });
  }
});

/* ================= CONTACT ================= */

app.post("/api/contact", async (req, res) => {

  try {

    const { name, email, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "📩 Contact Message",
      html: `
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Contact Mail Sent");

    res.json({ success: true });

  } catch (err) {
    console.log("❌ Contact Error:", err);
    res.status(500).json({ success: false });
  }
});

/* ================= SERVER ================= */

app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
