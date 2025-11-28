// consignment.js — FINAL WORKING VERSION

const API_URL = "https://elitewear-backend.onrender.com/upload-consignment";

let itemCount = 1;

// Add first empty item row automatically
document.addEventListener("DOMContentLoaded", () => {
  addItemRow();
});

function addItemRow() {
  const container = document.getElementById("items-container");

  const itemHTML = `
    <div class="item-row" id="item-${itemCount}">
      
      <div class="image-box" onclick="selectImage(${itemCount})">
        <span class="item-label">Item ${itemCount}</span>
        <input type="file" accept="image/*" id="image-${itemCount}" style="display:none" onchange="previewImage(event, ${itemCount})">
        <img id="preview-${itemCount}" class="preview-img" src="" style="display:none">
        <div class="plus">+</div>
      </div>

      <input type="text" class="input" id="name-${itemCount}" placeholder="Product Name">
      <input type="number" class="input" id="price-${itemCount}" placeholder="Price ₹">

      <button class="remove-btn" onclick="removeItem(${itemCount})">Remove</button>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", itemHTML);
  itemCount++;
}

function selectImage(id) {
  document.getElementById(`image-${id}`).click();
}

function previewImage(event, id) {
  const file = event.target.files[0];
  if (!file) return;

  const img = document.getElementById(`preview-${id}`);
  img.src = URL.createObjectURL(file);
  img.style.display = "block";

  // Add next row automatically only if this is the last row
  if (id === itemCount - 1) {
    addItemRow();
  }
}

function removeItem(id) {
  document.getElementById(`item-${id}`).remove();
}

async function submitAll() {
  const formData = new FormData();
  const items = [];

  for (let i = 1; i < itemCount; i++) {
    const name = document.getElementById(`name-${i}`);
    const price = document.getElementById(`price-${i}`);
    const img = document.getElementById(`image-${i}`);

    if (!name || !price || !img) continue;
    if (!img.files[0]) continue;

    items.push({
      name: name.value.trim(),
      price: price.value.trim()
    });

    formData.append("images", img.files[0]);
  }

  if (items.length === 0) {
    showError("Please upload at least one item.");
    return;
  }

  formData.append("items", JSON.stringify(items));

  showLoading();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      showSuccess("Consignment submitted successfully!");
    } else {
      showError(data.message);
    }
  } catch (err) {
    console.error(err);
    showError("Network error. Check backend server.");
  }
}

// ---------------- UI Helpers ----------------

function showLoading() {
  document.getElementById("status").innerHTML =
    `<div class="loading">Uploading...</div>`;
}

function showSuccess(msg) {
  document.getElementById("status").innerHTML =
    `<div class="success">${msg}</div>`;
}

function showError(msg) {
  document.getElementById("status").innerHTML =
    `<div class="error">${msg}</div>`;
}
