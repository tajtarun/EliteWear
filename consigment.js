const backendURL = "https://elitewear-backend.onrender.com/consign";

let items = [];

function renderItems() {
  const container = document.getElementById("itemsContainer");
  container.innerHTML = "";

  items.forEach((item, index) => {
    container.innerHTML += `
      <div class="item-card">
        <input type="file" accept="image/*" onchange="uploadImage(event, ${index})">

        <input type="text" placeholder="Product Name" 
          value="${item.name}" 
          onchange="items[${index}].name = this.value">

        <input type="number" placeholder="Price ₹"
          value="${item.price}"
          onchange="items[${index}].price = this.value">

        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });
}

function uploadImage(event, index) {
  items[index].file = event.target.files[0];
}

document.getElementById("addItemBtn").onclick = () => {
  items.push({ name: "", price: "", file: null });
  renderItems();
};

function removeItem(i) {
  items.splice(i, 1);
  renderItems();
}

document.getElementById("submitBtn").onclick = async () => {
  const error = document.getElementById("errorMessage");
  error.textContent = "";

  const form = new FormData();

  const names = items.map(i => i.name);
  const prices = items.map(i => i.price);

  form.append("names", JSON.stringify(names));
  form.append("prices", JSON.stringify(prices));

  items.forEach(item => {
    if (item.file) {
      form.append("images", item.file);
    }
  });

  try {
    const res = await fetch(backendURL, {
      method: "POST",
      body: form
    });

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();

    if (data.success) {
      window.location.href = "thankyou-consignment.html";
    } else {
      error.textContent = "Server error.";
    }

  } catch (err) {
    error.textContent = "Network error.";
  }
};

// initial render
renderItems();
