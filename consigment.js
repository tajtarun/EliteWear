// Add first card when page loads
window.onload = () => {
    addNewCard();
};

function addNewCard() {
    const container = document.getElementById("itemsContainer");

    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
        <div class="image-box">+</div>
        <input type="file" accept="image/*" hidden>
        
        <div class="inputs">
            <input type="text" placeholder="Product Name" class="pname">
            <input type="number" placeholder="Product Price" class="pprice">
        </div>
    `;

    const imgBox = card.querySelector(".image-box");
    const fileInput = card.querySelector("input[type='file']");
    const nameInput = card.querySelector(".pname");
    const priceInput = card.querySelector(".pprice");

    // Click image box → open gallery
    imgBox.addEventListener("click", () => fileInput.click());

    // After selecting image → show preview
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            const url = URL.createObjectURL(fileInput.files[0]);
            imgBox.innerHTML = `<img src="${url}">`;
            checkAndAddNewCard();
        }
    });

    // When typing name/price → check if new card needed
    nameInput.addEventListener("input", checkAndAddNewCard);
    priceInput.addEventListener("input", checkAndAddNewCard);

    container.appendChild(card);
}

// Check last card — if all filled → add new card
function checkAndAddNewCard() {
    const cards = document.querySelectorAll(".item-card");
    const lastCard = cards[cards.length - 1];

    const imgSelected = lastCard.querySelector("input[type='file']").files.length > 0;
    const nameFilled = lastCard.querySelector(".pname").value.trim() !== "";
    const priceFilled = lastCard.querySelector(".pprice").value.trim() !== "";

    if (imgSelected && nameFilled && priceFilled) {
        addNewCard();
    }
}

document.getElementById("submitBtn").addEventListener("click", () => {
    const items = [];

    const cards = document.querySelectorAll(".item-card");
    cards.forEach(card => {
        const fileInput = card.querySelector("input[type='file']");
        const name = card.querySelector(".pname").value.trim();
        const price = card.querySelector(".pprice").value.trim();

        if (fileInput.files.length > 0 && name && price) {
            items.push({
                image: fileInput.files[0],
                name,
                price
            });
        }
    });

    console.log("Items ready to upload:", items);

    alert("Items collected! Now send them to backend with fetch().");

    // You can add your backend API upload here.
});
