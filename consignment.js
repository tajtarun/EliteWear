const API_URL = "https://elitewear-backend.onrender.com";

const form = document.getElementById("consignForm");

if (form) {

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const image = document.getElementById("image").files[0];
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;

    if (!image || !name || !price) {
      alert("Fill all fields");
      return;
    }

    const data = new FormData();

    data.append("image", image);
    data.append("name", name);
    data.append("price", price);

    try {

      const res = await fetch(`${API_URL}/consignment`, {
        method: "POST",
        body: data
      });

      const result = await res.json();

      if (result.success) {
        window.location.href = "thankyou-consignment.html";
      } else {
        alert("Submit failed");
      }

    } catch (err) {
      alert("Server error");
    }

  });

}
