const popup = document.getElementById("popup");
const itemsContainer = document.getElementById("items-container");
const form = document.getElementById("consignmentForm");
const errorBox = document.getElementById("error-message");

function openPopup() {
  popup.style.display = "flex";
  if (itemsContainer.children.length === 0) {
    addNewItem();
  }
}

function addNewItem() {
  const item = document.createElement("div");
  item.className = "item-row";

  item.innerHTML = `
    <div class="image-box">
      +
      <input type="file" accept="image/*">
    </div>
    <div class="fields">
      <input type="text" name="names[]" placeholder="Product Name">
      <input type="text" name="prices[]" placeholder="Product Price">
    </div>
  `;

  const fileInput = item.querySelector("input[type='file']");
  const imageBox = item.querySelector(".image-box");

  imageBox.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      const img = document.createElement("img");
      img.className = "image-preview";
      img.src = URL.createObjectURL(file);
      imageBox.innerHTML = "";
      imageBox.appendChild(img);
      imageBox.appendChild(fileInput);
      checkClone();
    }
  });

  const inputs = item.querySelectorAll("input[type='text']");
  inputs.forEach(input => {
    input.addEventListener("input", checkClone);
  });

  itemsContainer.appendChild(item);
}

function checkClone() {
  const rows = document.querySelectorAll(".item-row");
  const last = rows[rows.length - 1];

  const file = last.querySelector("input[type='file']").files.length;
  const name = last.querySelector("input[name='names[]']").value.trim();
  const price = last.querySelector("input[name='prices[]']").value.trim();

  if (file && name && price) {
    addNewItem();
  }
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  errorBox.innerHTML = "";

  const rows = document.querySelectorAll(".item-row");
  const formData = new FormData();

  let validItems = 0;

  for (let row of rows) {
    const fileInput = row.querySelector("input[type='file']");
    const nameInput = row.querySelector("input[name='names[]']");
    const priceInput = row.querySelector("input[name='prices[]']");

    const file = fileInput.files[0];
    const name = nameInput.value.trim();
    const price = priceInput.value.trim();

    if (!file && !name && !price) continue;

    if (!file || !name || !price) {
      errorBox.innerHTML = "Please fill image, name and price for all items.";
      return;
    }

    formData.append("files", file);
    formData.append("names[]", name);
    formData.append("prices[]", price);

    validItems++;
  }

  if (validItems === 0) {
    errorBox.innerHTML = "Add at least one item.";
    return;
  }

  try {
    const response = await fetch("https://elitewear.onrender.com/submit-consignment", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      window.location.href = "thankyou-consignment.html";
    } else {
      errorBox.innerHTML = "Submission failed.";
    }

  } catch (err) {
    errorBox.innerHTML = "Server error. Try again.";
  }
});
