// -------------------------
//  IMPORTS
// -------------------------
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------
//  CORS FIX (IMPORTANT FOR GITHUB PAGES)
// -------------------------
app.use(
  cors({
    origin: "*", // allow GitHub pages
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// -------------------------
//  CREATE UPLOADS FOLDER IF NOT EXISTS
// -------------------------
const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// -------------------------
//  MULTER STORAGE
// -------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

// -------------------------
//  API: Receive Consignment Items
// -------------------------
app.post("/upload-consign", upload.array("images", 20), (req, res) => {
  try {
    const images = req.files;
    const { items } = req.body;

    const parsedItems = JSON.parse(items);

    const finalData = parsedItems.map((item, index) => ({
      name: item.name,
      price: item.price,
      image: images[index] ? images[index].filename : null,
    }));

    console.log("Received:", finalData);

    return res.json({
      success: true,
      message: "Items uploaded successfully!",
      data: finalData,
    });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// -------------------------
//  START SERVER
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
