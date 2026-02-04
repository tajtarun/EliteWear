require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Data files
const PRODUCTS_FILE = "./data/products.json";
const ORDERS_FILE = "./data/orders.json";

// Ensure data folders
if (!fs.existsSync("data")) fs.mkdirSync("data");
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

if (!fs.existsSync(PRODUCTS_FILE))
  fs.writeFileSync(PRODUCTS_FILE, "[]");

if (!fs.existsSync(ORDERS_FILE))
  fs.writeFileSync(ORDERS_FILE, "[]");

// File Upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage });

// Mail Config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.APP_PASSWORD
  }
});

// Helpers
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ================= ADMIN =================

// Upload Product
app.post("/api/admin/add-product", upload.single("image"), (req, res) => {

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

  res.json({ success: true });
});

// Get Products
app.get("/api/products", (req, res) => {
  res.json(readJSON(PRODUCTS_FILE));
});

// ================= CART / ORDER =================

// Place Order
app.post("/api/order", async (req, res) => {

  const { user, cart, total } = req.body;

  const orders = readJSON(ORDERS_FILE);

  const order = {
    id: Date.now(),
    user,
    cart,
    total,
    date: new Date()
  };

  orders.push(order);
  writeJSON(ORDERS_FILE, orders);

  // Build Email
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
    from: process.env.GMAIL,
    to: process.env.GMAIL,
    subject: "🛒 New Order - EliteWear",
    html: `
      <h2>New Order Received</h2>

      <h3>Customer</h3>
      <p>
        Name: ${user.name}<br>
        Email: ${user.email}<br>
        Phone: ${user.phone}<br>
        Address: ${user.address}
      </p>

      <h3>Items</h3>
      ${itemsHTML}

      <h3>Total: ₹${total}</h3>
    `
  };

  await transporter.sendMail(mailOptions);

  res.json({ success: true });
});

// ================= CONSIGNMENT =================

app.post("/api/consignment", upload.single("image"), async (req, res) => {

  const { name, price } = req.body;
  const image = req.file.filename;

  const mailOptions = {
    from: process.env.GMAIL,
    to: process.env.GMAIL,
    subject: "📦 New Consignment",
    html: `
      <h2>New Consignment</h2>

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

  res.json({ success: true });
});

// ================= CONTACT =================

app.post("/api/contact", async (req, res) => {

  const { name, email, message } = req.body;

  const mailOptions = {
    from: process.env.GMAIL,
    to: process.env.GMAIL,
    subject: "📩 Contact Message",
    html: `
      <h3>Contact Form</h3>

      <p>Name: ${name}</p>
      <p>Email: ${email}</p>
      <p>${message}</p>
    `
  };

  await transporter.sendMail(mailOptions);

  res.json({ success: true });
});

// ================= SERVER =================

app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
