emailjs.init("ZOt4YXfU6cDioZWJG");

const EMAILJS_SERVICE_ID = "service_f8g34x6";
const EMAILJS_TEMPLATE_ID = "template_trg9yth";

const SUPABASE_URL = "https://eonwirzbhwcpfqiltyjp.supabase.co";
const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbndpcnpiaHdjcGZxaWx0eWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTYwNjksImV4cCI6MjA3OTczMjA2OX0.kT-pqelZyTfiaoaKSbSqFLPW7xwbemZ2V4Y-WpyHN8Q";

const BUCKET = "product-images";
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let productIndex = 0;

// CREATE NEW PRODUCT ROW
function addProductRow() {
    productIndex++;

    const row = document.createElement("div");
    row.classList.add("product-row");
    row.setAttribute("data-index", productIndex);

    row.innerHTML = `
        <div class="image-box" onclick="document.getElementById('image_${productIndex}').click()">
            <span class="plus" id="plus_${productIndex}">+</span>
            <img id="preview_${productIndex}">
        </div>

        <input type="file" id="image_${productIndex}" accept="image/*" hidden>

        <div class="inputs">
            <label>Product Name *</label>
            <input type="text" id="name_${productIndex}" required>

            <label>Product Price *</label>
            <input type="number" id="price_${productIndex}" required>
        </div>
    `;

    document.getElementById("productList").appendChild(row);

    // IMAGE PREVIEW
    document.getElementById(`image_${productIndex}`).addEventListener("change", () => {
        const file = document.getElementById(`image_${productIndex}`).files[0];
        if (file) {
            document.getElementById(`preview_${productIndex}`).src = URL.createObjectURL(file);
            document.getElementById(`preview_${productIndex}`).style.display = "block";
            document.getElementById(`plus_${productIndex}`).style.display = "none";
        }
    });
}

// FIRST ROW WHEN PAGE LOADS
addProductRow();

// ADD MORE PRODUCTS
document.getElementById("addRowBtn").onclick = () => addProductRow();

// SUBMIT BUTTON
document.getElementById("submitBtn").onclick = async () => {

    const userName = document.getElementById("user_name").value.trim();
    const userEmail = document.getElementById("user_email").value.trim();

    if (!userName || !userEmail) {
        alert("Please enter your name and email.");
        return;
    }

    document.getElementById("loadingSpinner").style.display = "block";

    let productHTML = "";
    let uploadedImages = [];

    try {
        for (let i = 1; i <= productIndex; i++) {

            const name = document.getElementById(`name_${i}`).value;
            const price = document.getElementById(`price_${i}`).value;
            const file = document.getElementById(`image_${i}`).files[0];

            if (!name || !price || !file) continue;

            const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

            // Upload image
            const upload = await supabase.storage.from(BUCKET).upload(fileName, file);
            const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

            uploadedImages.push(pub.publicUrl);

            // Add this product into email HTML
            productHTML += `
                <p><b>Product:</b> ${name}</p>
                <p><b>Price:</b> ₹${price}</p>
                <img src="${pub.publicUrl}" width="260" style="border-radius:10px;">
                <hr style="border:1px solid gold;margin:20px 0;">
            `;
        }

        // SEND EMAIL
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            user_name: userName,
            user_email: userEmail,
            product_details_html: productHTML
        });

        // Redirect
        window.location.href = "thankyou-consignment.html";

    } catch (err) {
        console.error(err);
        alert("Error sending form.");
    }

    document.getElementById("loadingSpinner").style.display = "none";
};
