// -------------------------------------------------
// CHANGE ONLY THIS ONE LINE IF YOUR ENDPOINT IS DIFFERENT
// -------------------------------------------------
const API_URL = "https://elitewear-backend.onrender.com/consignment";
// -------------------------------------------------

async function submitConsignment() {

    const name = document.getElementById("pname").value.trim();
    const price = document.getElementById("pprice").value.trim();
    const desc = document.getElementById("pdesc").value.trim();
    const file = document.getElementById("pimage").files[0];

    if (!name || !price || !desc || !file) {
        alert("Please fill all fields.");
        return;
    }

    document.getElementById("loadingSpinner").style.display = "block";

    const formData = new FormData();
    formData.append("productName", name);
    formData.append("price", price);
    formData.append("description", desc);
    formData.append("image", file);

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Server error");

        alert("Your consignment has been successfully submitted!");
        window.location.href = "thankyou-consignment.html";

    } catch (err) {
        alert("Network Error: Unable to submit. Check backend URL.");
    }

    document.getElementById("loadingSpinner").style.display = "none";
}
