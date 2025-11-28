// Backend API (Render)
const API_URL = "https://elitewear-backend.onrender.com/upload";

let itemCount = 0;

function addItem() {
    itemCount++;

    const box = document.createElement("div");
    box.className = "item-card";
    box.id = `item-${itemCount}`;

    box.innerHTML = `
        <input type="file" accept="image/*" id="img-${itemCount}" onchange="previewImage(${itemCount})" hidden>
        
        <label for="img-${itemCount}">
            <img id="preview-${itemCount}" src="https://via.placeholder.com/110" />
        </label>

        <div style="flex:1;">
            <input type="text" id="name-${itemCount}" placeholder="Product Name">
            <br><br>
            <input type="number" id="price-${itemCount}" placeholder="Price ₹">
        </div>

        <button onclick="removeItem(${itemCount})" style="background:#d9534f;color:white;">Remove</button>
    `;

    document.getElementById("itemList").appendChild(box);
}

function previewImage(id) {
    const file = document.getElementById(`img-${id}`).files[0];
    const img = document.getElementById(`preview-${id}`);

    if (file) img.src = URL.createObjectURL(file);
}

function removeItem(id) {
    document.getElementById(`item-${id}`).remove();
}

async function submitAll() {
    const resultBox = document.getElementById("result");
    resultBox.style.display = "none";

    const items = document.querySelectorAll(".item-card");
    if (items.length === 0) {
        alert("Add at least 1 item.");
        return;
    }

    for (let i = 1; i <= itemCount; i++) {
        const img = document.getElementById(`img-${i}`);
        const name = document.getElementById(`name-${i}`);
        const price = document.getElementById(`price-${i}`);

        if (!img || !name || !price) continue;
        if (!img.files[0] || name.value.trim() === "" || price.value.trim() === "") continue;

        const formData = new FormData();
        formData.append("image", img.files[0]);
        formData.append("name", name.value);
        formData.append("price", price.value);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            console.log("Uploaded:", data);

        } catch (err) {
            resultBox.style.display = "block";
            resultBox.innerText = "Network Error: Cannot connect to server.";
            return;
        }
    }

    alert("All items submitted successfully!");
}
