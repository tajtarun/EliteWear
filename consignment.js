// INIT EMAILJS
emailjs.init("ZOt4YXfU6cDioZWJG");

const EMAILJS_SERVICE_ID = "service_f8g34x6";
const EMAILJS_TEMPLATE_ID = "template_trg9yth";

const SUPABASE_URL = "https://eonwirzbhwcpfqiltyjp.supabase.co";
const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbndpcnpiaHdjcGZxaWx0eWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTYwNjksImV4cCI6MjA3OTczMjA2OX0.kT-pqelZyTfiaoaKSbSqFLPW7xwbemZ2V4Y-WpyHN8Q";

const BUCKET = "product-images";
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// IMAGE PREVIEW
document.getElementById("product_image").addEventListener("change", () => {
    const file = product_image.files[0];
    if (file) {
        previewImage.src = URL.createObjectURL(file);
        previewImage.style.display = "block";
        plusIcon.style.display = "none";
    }
});

// FORM SUBMISSION
document.getElementById("consignmentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const productName = product_name.value.trim();
    const productPrice = product_price.value.trim();
    const file = product_image.files[0];

    if (!file) {
        alert("Please upload product image.");
        return;
    }

    loadingSpinner.style.display = "block";

    try {
        // upload to Supabase
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
        const uploadRes = await supabase.storage.from(BUCKET).upload(fileName, file);
        if (uploadRes.error) throw uploadRes.error;

        // get public URL
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
        const imageUrl = pub.publicUrl;

        // send email
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            product_name: productName,
            product_price: productPrice,
            attachment: imageUrl
        });

        // now redirect
        window.location.href = "thankyou-consignment.html";

    } catch (err) {
        console.error(err);
        alert("Error occurred — check console.");
    }

    loadingSpinner.style.display = "none";
});
