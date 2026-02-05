// LIVE BACKEND URL
const API_URL = "https://elitewear-backend.onrender.com/api";

/* ========================
   CART SYSTEM
======================== */

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartCount = document.getElementById("cart-count");

  if (cartCount) {
    cartCount.textContent = count;
  }
}

/* ========================
   ADD TO CART
======================== */

function addToCart(id, name, price, image) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id,
      name,
      price,
      image,
      qty: 1
    });
  }

  saveCart();
  alert("Added to cart!");
}

/* ========================
   LOAD PRODUCTS
======================== */

async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();

    const container = document.getElementById("product-list");

    if (!container) return;

    container.innerHTML = "";

    products.forEach(p => {
      const div = document.createElement("div");
      div.className = "product";

      div.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>₹${p.price}</p>
        <button onclick="addToCart('${p._id}','${p.name}',${p.price},'${p.image}')">
          Add to Cart
        </button>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("Load products error:", err);
  }
}

/* ========================
   CHECKOUT
======================== */

async function placeOrder(userData) {
  try {
    const res = await fetch(`${API_URL}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: userData,
        cart: cart
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Order placed successfully!");

      cart = [];
      saveCart();

      localStorage.setItem("userSignedIn", "true");
      localStorage.setItem("userData", JSON.stringify(userData));

      window.location.href = "index.html";
    } else {
      alert("Order failed");
    }

  } catch (err) {
    console.error("Order error:", err);
  }
}

/* ========================
   SIGN IN CHECK
======================== */

function isSignedIn() {
  return localStorage.getItem("userSignedIn") === "true";
}

function getUserData() {
  return JSON.parse(localStorage.getItem("userData"));
}

/* ========================
   INIT
======================== */

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadProducts();
});
