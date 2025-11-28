// ----------------------------
// FIXED: CORRECT BACKEND URL
// ----------------------------
const ENDPOINT = "https://elitewear-backend.onrender.com/consign";

// HANDLE FORM SUBMIT
document.getElementById("consignmentForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    try {
        const response = await fetch(ENDPOINT, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            alert("Upload failed. Please try again.");
            return;
        }

        // Redirect to thank you page
        window.location.href = "consignment_thankyou.html";

    } catch (error) {
        console.error(error);
        alert("Network Error! Please check connection.");
    }
});


// ----------------------------
// IMAGE PREVIEW (your old code)
// ----------------------------
const fileInput = document.getElementById("imageUpload");
const previewBox = document.getElementById("previewBox");

fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
        previewBox.style.backgroundImage = `url('${reader.result}')`;
        previewBox.classList.add("filled"); 
    };
    reader.readAsDataURL(file);
});
