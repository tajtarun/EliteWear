<script>
// --------------------------------------------
// EmailJS SETUP
// --------------------------------------------
emailjs.init("ZOt4YXfU6cDioZWJG");  

const EMAILJS_SERVICE_ID = "service_f8g34x6";
const EMAILJS_TEMPLATE_ID = "template_trg9yth";

// --------------------------------------------
// SUPABASE SETUP
// --------------------------------------------
const SUPABASE_URL = "https://eonwirzbhwcpfqiltyjp.supabase.co";
const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbndpcnpiaHdjcGZxaWx0eWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTYwNjksImV4cCI6MjA3OTczMjA2OX0.kT-pqelZyTfiaoaKSbSqFLPW7xwbemZ2V4Y-WpyHN8Q";

const BUCKET = "product-images";

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --------------------------------------------
// IMAGE PREVIEW
// --------------------------------------------
const imageInput = document.getElementById("product_image");
const previewImage = document.getElementById("previewImage");
const plusIcon = document.getElementById("plusIcon");

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
        previewImage.src = URL.createObjectURL(file);
        previewImage.style.display = "block";
        plusIcon.style.display = "none";
    }
});

// --------------------------------------------
// FORM SUBMIT HANDLER
// --------------------------------------------
document.getElementById("consignmentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    document.getElementById("loadingSpinner").style.display = "block";

    const productName = document.getElementById("product_name").value.trim();
    const productPrice = document.getElementById("product_price").value.trim();
    const productDesc = document.getElementById("product_description").value.trim();
    const file = document.getElementById("product_image").files[0];

    if (!file) {
        alert("Please upload your product image.");
        document.getElementById("loadingSpinner").style.display = "none";
        return;
    }

    try {
        // ------------------ 1) Upload Image to Supabase ------------------
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

        const uploadRes = await supabase.storage
            .from(BUCKET)
            .upload(fileName, file);

        if (uploadRes.error) throw uploadRes.error;

        const { data: pub } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(fileName);

        const imageUrl = pub.publicUrl;

        // ------------------ 2) Insert into Supabase Database ------------------
        await supabase.from("products").insert([
            {
                product_name: productName,
                product_price: productPrice,
                description: productDesc,
                image_url: imageUrl
            }
        ]);

        // ------------------ 3) Send Email via EmailJS ------------------
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            product_name: productName,
            product_price: productPrice,
            product_description: productDesc,
            image_url: imageUrl,
            year: new Date().getFullYear()
        });

        // ------------------ 4) Redirect to Thank You Page ------------------
        window.location.href = "thankyou-consignment.html";

    } catch (err) {
        console.error(err);
        alert("Error submitting. Check console.");
    }

    document.getElementById("loadingSpinner").style.display = "none";
});
</script>
