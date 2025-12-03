emailjs.init("ZOt4YXfU6cDioZWJG");

const EMAILJS_SERVICE_ID = "service_f8g34x6";
const EMAILJS_TEMPLATE_ID = "template_trg9yth";

const SUPABASE_URL = "https://eonwirzbhwcpfqiltyjp.supabase.co";
const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbndpcnpiaHdjcGZxaWx0eWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTYwNjksImV4cCI6MjA3OTczMjA2OX0.kT-pqelZyTfiaoaKSbSqFLPW7xwbemZ2V4Y-WpyHN8Q";

const BUCKET = "product-images";

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("consignmentForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productName = document.getElementById("product_name").value.trim();
    const productPrice = document.getElementById("product_price").value.trim();
    const productDesc = document.getElementById("product_description").value.trim();
    
    const userName = document.getElementById("user_name").value.trim();
    const userEmail = document.getElementById("user_email").value.trim();
    const userPhone = document.getElementById("user_phone").value.trim();

    const file = document.getElementById("product_image").files[0];

    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

      const uploadRes = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file);

      const { data: pub } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      const imageUrl = pub.publicUrl;

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        product_name: productName,
        product_price: productPrice,
        product_description: productDesc,
        user_name: userName,
        user_email: userEmail,
        user_phone: userPhone,
        image_url: imageUrl,
        year: new Date().getFullYear()
      });

      window.location.href = "thankyou-consignment.html";

    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  });
});
