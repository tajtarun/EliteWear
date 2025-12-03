/* -------------------------
   CONFIG
-------------------------- */

// EmailJS
emailjs.init("ZOt4YXfU6cDioZWJG");  // Public Key

const EMAILJS_SERVICE_ID = "service_f8g34x6";
const EMAILJS_TEMPLATE_ID = "template_trg9yth";

// Supabase
const SUPABASE_URL = "https://eonwirzbhwcpfqiltyjp.supabase.co";
const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbndpcnpiaHdjcGZxaWx0eWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTYwNjksImV4cCI6MjA3OTczMjA2OX0.kT-pqelZyTfiaoaKSbSqFLPW7xwbemZ2V4Y-WpyHN8Q";

const BUCKET = "product-images";

/* -------------------------
   INIT SUPABASE CLIENT
-------------------------- */
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


/* -------------------------
   SHOW/HIDE LOADING
-------------------------- */
function showLoading(show = true) {
  const el = document.getElementById("loadingSpinner");
  if (!el) return;
  el.style.display = show ? "block" : "none";
}


/* -------------------------
   CONSIGNMENT FORM SUBMIT
-------------------------- */
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("consignmentForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading(true);

    // Collect values
    const productName = document.getElementById("product_name").value.trim();
    const productPrice = document.getElementById("product_price").value.trim();
    const productDesc = document.getElementById("product_description").value.trim();
    const userEmail = document.getElementById("user_email").value.trim();
    const userPhone = document.getElementById("user_phone").value.trim();
    const file = document.getElementById("product_image").files[0];

    if (!productName || !productPrice || !productDesc || !file) {
      alert("Please fill all required fields and select an image.");
      showLoading(false);
      return;
    }

    try {
      // 1) Upload image to Supabase Storage
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

      const uploadRes = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file);

      if (uploadRes.error) throw uploadRes.error;

      // 2) Get public URL
      const { data: pub } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      const imageUrl = pub.publicUrl;

      // 3) Insert record into Supabase table
      const insertRes = await supabase.from("products").insert([
        {
          product_name: productName,
          product_price: productPrice,
          description: productDesc,
          image_url: imageUrl,
          user_email: userEmail,
          phone: userPhone
        }
      ]);

      if (insertRes.error) throw insertRes.error;

      // 4) Send email through EmailJS
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        product_name: productName,
        product_price: productPrice,
        product_description: productDesc,
        user_email: userEmail,
        user_phone: userPhone,
        image_url: imageUrl,
        year: new Date().getFullYear()
      });

      showLoading(false);

      // 5) Redirect to thank you page
      window.location.href = "thankyou-consignment.html";

    } catch (err) {
      console.error(err);
      alert("Error submitting form. Check console for details.");
      showLoading(false);
    }
  });
});
