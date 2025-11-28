// consignment.js  — FINAL WORKING VERSION
// NOTE: If your HTML uses <script src="conjungment.js">, rename this file to conjungment.js

// -------------------------
// BACKEND ENDPOINT (REQUIRED)
// -------------------------
const BACKEND = "https://elitewear-backend.onrender.com/upload-consignment";

// -------------------------
// DOM ELEMENTS
// -------------------------
const openUploader = document.getElementById("openUploader");
const popupBg = document.getElementById("popupBg");
const closePopup = document.getElementById("closePopup");
const rowsContainer = document.getElementById("rowsContainer");
const submitAll = document.getElementById("submitAll");
const statusBox = document.getElementById("statusBox");

// -------------------------
// Add Rows
// -------------------------
let rowCount = 0;

function createRow() {
  rowCount++;

  const row = document.createElement("div");
  row.className = "row";

  // LEFT SIDE (Image uploader)
  const left = document.createElement("div");
  left.className = "left";

  const plus = document.createElement("div");
  plus.className = "plus";
  plus.textContent = "+";

  const badge = document.createElement("div");
  badge.className = "index-badge";
  badge.textContent = "Item " + rowCount;

  const img = document.createElement("img");
  img.style.display = "none";

  const inputFile = document.createElement("input");
  inputFile.type = "file";
  inputFile.accept = "image/*";
  inputFile.style.display = "none";

  left.appendChild(badge);
  left.appendChild(plus);
  left.appendChild(img);
  left.appendChild(inputFile);

  left.onclick = () => inputFile.click();

  inputFile.onchange = () => {
    const f = inputFile.files[0];
    if (f) {
      img.src = URL.createObjectURL(f);
      img.style.display = "block";
      plus.style.display = "none";
      left.style.border = "2px solid var(--gold)";

      // Automatically create a new empty row if last one
      if (row === rowsContainer.lastElementChild) createRow();
    }
  };

  // RIGHT SIDE (Name + Price)
  const fields = document.createElement("div");
  fields.className = "fields";

  const nameInput = document.createElement("input");
  nameInput.placeholder = "Product Name";

  const priceInput = document.createElement("input");
  priceInput.placeholder = "Price ₹";
  priceInput.type = "number";

  fields.appendChild(nameInput);
  fields.appendChild(priceInput);

  // REMOVE BUTTON
  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-row";
  removeBtn.textContent = "Remove";

  removeBtn.onclick = () => {
    if (rowsContainer.children.length > 1) {
      row.remove();
    } else {
      nameInput.value = "";
      priceInput.value = "";
      inputFile.value = "";
      img.style.display = "none";
      plus.style.display = "block";
      left.style.border = "2px dashed rgba(212,175,55,0.25)";
    }
  };

  row.appendChild(left);
  row.appendChild(fields);
  row.appendChild(removeBtn);
  rowsContainer.appendChild(row);
}

// -------------------------
// Popup Open/Close
// -------------------------
openUploader.onclick = () => {
  popupBg.style.display = "flex";
  rowsContainer.innerHTML = "";
  rowCount = 0;
  createRow();
};

closePopup.onclick = () => {
  popupBg.style.display = "none";
};

// -------------------------
// Submit All Items
// -------------------------
submitAll.onclick = async () => {
  statusBox.innerHTML = "";

  const rows = Array.from(rowsContainer.children);
  const fd = new FormData();

  let anyImage = false;
  const items = [];

  rows.forEach((row) => {
    const fInput = row.querySelector("input[type=file]");
    const name = row.querySelector("input[placeholder='Product Name']").value || "";
    const price = row.querySelector("input[placeholder='Price ₹']").value || "";

    items.push({ name, price });

    if (fInput && fInput.files.length > 0) {
      fd.append("files", fInput.files[0]); // name MUST match backend
      anyImage = true;
    }
  });

  if (!anyImage) {
    statusBox.innerHTML = `<div class="status error">Please upload at least one image.</div>`;
    return;
  }

  // attach product metadata
  fd.append("items", JSON.stringify(items));

  statusBox.innerHTML = `<div class="status">Sending...</div>`;

  try {
    const res = await fetch(BACKEND, {
      method: "POST",
      body: fd,
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = "thankyou-consignment.html";
    } else {
      statusBox.innerHTML = `<div class="status error">Server error.</div>`;
    }
  } catch (err) {
    console.error("NETWORK ERROR:", err);
    statusBox.innerHTML = `<div class="status error">Network error. Could not reach server.</div>`;
  }
};
