const form = document.getElementById("consignmentForm");
const errorBox = document.getElementById("error-message");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    errorBox.innerHTML = "";

    const fileInput = document.querySelector("input[type='file']");
    const productName = document.querySelector("input[name='productName']").value.trim();
    const price = document.querySelector("input[name='price']").value.trim();

    let missing = [];

    if (!fileInput.files.length) {
        missing.push("Product Image");
    }

    if (!productName) {
        missing.push("Product Name");
    }

    if (!price) {
        missing.push("Price");
    }

    if (missing.length > 0) {
        errorBox.innerHTML = "Missing: " + missing.join(", ");
        return;
    }

    const formData = new FormData();
    formData.append("files", fileInput.files[0]);
    formData.append("productName", productName);
    formData.append("price", price);

    try {
        const response = await fetch("https://elitewear.onrender.com/submit-consignment", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            errorBox.innerHTML = result.message || "Submission failed";
        } else {
            window.location.href = "ThankYouConsignment.html";
        }

    } catch (error) {
        errorBox.innerHTML = "Server error. Try again.";
    }
});
