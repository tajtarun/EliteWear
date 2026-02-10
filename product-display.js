import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://eonwirzbhwcpfqiltyjp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbndpcnpiaHdjcGZxaWx0eWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTYwNjksImV4cCI6MjA3OTczMjA2OX0.kT-pqelZyTfiaoaKSbSqFLPW7xwbemZ2V4Y-WpyHN8Q";

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadProducts(){
  const container = document.getElementById("live-products");

  const { data, error } = await supabase.from("products").select("*");

  if(error){
    container.innerHTML = "<p>Error loading products</p>";
    return;
  }

  container.innerHTML = "";
  data.forEach(p => {
    container.innerHTML += `
      <article class="card reveal" data-animate>
        <div class="product-img" style="background-image:url('${p.image}')"></div>
        <strong>${p.name}</strong>
        <div><span style="color:var(--gold-start);font-weight:800">₹${p.price}</span></div>
      </article>
    `;
  });
}

loadProducts();
