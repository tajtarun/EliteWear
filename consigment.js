const API_URL = "https://elitewear-backend.onrender.com";

// ⭐ Wake Backend When Page Loads
async function wakeServer() {
    try {
        document.getElementById("errorBox").innerHTML = "Waking server...";
        await fetch(API_URL + "/");
        document.getElementById("errorBox").innerHTML = "";
    } catch (e) {
        console.log("Wake fail", e);
    }
}
wakeServer();

// ⭐ Items Array
let items = [
    { image: null, name: "", price: "" }
];

// ⭐ Render Item Cards
function renderItems() {
    const container = document.getElementById("itemsContainer");
    container.innerHTML = "";

    items.forEach((item, index) => {
        container.innerHTML += `
        <div class="item-card">

            <label class="upload-box">
                ${item.image ? `<img src="${item.image}">` : `<div class="plus">+</div>`}
                <input type="file" accept="image/*" onchange="handleImage(event, ${index})" hidden>
            </label>

            <input class="input-box" placeholder="Product Name" value="${item.name}" onchange="updateName(${index}, this.value)">
            <input class="input-box" placeholder="Price ₹" value="${item.price}" onchange="updatePrice(${index}, this.value)">

            <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
        </div>
        `;
    });

    // Add new card
    container.innerHTML += `
        <div class="item-card add-card" onclick="addItem()">
            <div class="plus">+</div>
        </div>
    `;
}

// ⭐ Update Functions
function handleImage(event, index) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        items[index].image = reader.result;
        renderItems();
    };
    reader.readAsDataURL(file);
}

function updateName(index, value) {
    items[index].name = value;
}

function updatePrice(index, value) {
    items[index].price = value;
}

function addItem() {
    items.push({ image: null, name: "", price: "" });
    renderItems();
}

function removeItem(index) {
    items.splice(index, 1);
    renderItems();
}

// ⭐ Submit All
async function submitAll() {
    document.getElementById("errorBox").innerHTML = "";

    const formData = new FormData();
    formData.append("products", JSON.stringify(items));

    // Convert base64 → File
    items.forEach((item, index) => {
        if (item.image) {
            const arr = item.image.split(",");
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8 = new Uint8Array(n);
            while (n--) {
                u8[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8], `item${index + 1}.jpg`, { type: "image/jpeg" });
            formData.append("images", file);
        }
    });

    try {
        document.getElementById("errorBox").innerHTML = "Submitting… please wait";

        const response = await fetch(API_URL + "/consign", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            window.location.href = "thankyou-consign.html";
        } else {
            document.getElementById("errorBox").innerHTML = "Server error.";
        }
    } catch (err) {
        document.getElementById("errorBox").innerHTML =
            "Server waking… Retrying in 5 seconds…";

        setTimeout(() => submitAll(), 5000);
    }
}

// ⭐ INITIAL RENDER
renderItems();
