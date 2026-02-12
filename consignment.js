const container = document.getElementById("itemsContainer");
const form = document.getElementById("consignmentForm");
const errorBox = document.getElementById("error-message");

function createItemRow() {
    const row = document.createElement("div");
    row.className = "item-row";

    row.innerHTML = `
        <div>
            <label class="image-upload">+</label>
            <input type="file" accept="image/*">
        </div>

        <div class="form-section">
            <label>Product Name</label>
            <input type="text" class="productName">

            <label>Product Price</label>
            <input type="text" class="price">
        </div>
    `;

    const fileInput = row.querySelector("input[type='file']");
    const imageBox = row.querySelector(".image-upload");

    imageBox.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                imageBox.innerHTML = `<img src="${e.target.result}">`;
            };
            reader.readAsDataURL(file);
            checkClone();
        }
    });

    row.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", checkClone);
    });

    container.appendChild(row);
}

function checkClone() {
    const rows = document.querySelectorAll(".item-row");
    const last = rows[rows.length - 1];

    const file = last.querySelector("input[type='file']").files.length;
    const name = last.querySelector(".productName").value.trim();
    const price = last.querySelector(".price").value.trim();

    if (file && name && price) {
        createItemRow();
    }
}

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorBox.innerHTML = "";

    const rows = document.querySelectorAll(".item-row");
    const formData = new FormData();

    let valid = false;

    rows.forEach(row => {
        const fileInput = row.querySelector("input[type='file']");
        const name = row.querySelector(".productName").value.trim();
        const price = row.querySelector(".price").value.trim();

        if (fileInput.files.length || name || price) {
            if (!fileInput.files.length || !name || !price) {
                errorBox.innerHTML = "Please complete all fields for each item.";
                valid = false;
                return;
            }

            formData.append("files", fileInput.files[0]);
            formData.append("names[]", name);
            formData.append("prices[]", price);
            valid = true;
        }
    });

    if (!valid) {
        errorBox.innerHTML = "Please add at least one complete item.";
        return;
    }

    try {
        const response = await fetch("https://elitewear.onrender.com/submit-consignment", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            errorBox.innerHTML = "Submission failed.";
        } else {
            window.location.href = "ThankYouConsignment.html";
        }

    } catch {
        errorBox.innerHTML = "Server error.";
    }
});

createItemRow();
