import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://eonwirzbhwcpfqiltyjp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbndpcnpiaHdjcGZxaWx0eWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTYwNjksImV4cCI6MjA3OTczMjA2OX0.kT-pqelZyTfiaoaKSbSqFLPW7xwbemZ2V4Y-WpyHN8Q";

const supabase = createClient(supabaseUrl, supabaseKey);

window.uploadProduct = async function () {
  const file = document.getElementById("file").files[0];
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;

  if(!file || !name || !price){
    alert("Please fill all fields.");
    return;
  }

  const filename = Date.now() + "_" + file.name;

  // Upload image
  const { data: imgData, error: imgErr } = await supabase.storage
    .from("product_images")
    .upload(filename, file);

  if(imgErr){
    alert("Image upload failed");
    console.log(imgErr);
    return;
  }

  const imageUrl = supabase.storage.from("product_images").getPublicUrl(filename).data.publicUrl;

  // Insert into products table
  const { error } = await supabase
    .from("products")
    .insert([{ name, price, image: imageUrl }]);

  if(error){
    alert("Product upload failed");
    console.log(error);
  } else {
    alert("Product added successfully!");
  }
};
