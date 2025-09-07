const API_URL = "http://localhost:5000/api";

if (window.location.pathname.endsWith("index.html")) {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.addEventListener("click", login);
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "products.html";
    } else {
      alert(data.error || "Login failed");
      const msg = document.getElementById("message");
      if (msg) msg.innerText = data.error || data.message;
    }
  })
  .catch(err => alert("Server error. Please try again."));
}

if (window.location.pathname.endsWith("products.html")) {
  fetchProducts();
}

function fetchProducts() {
  fetch(`${API_URL}/products`)
    .then(res => res.json())
    .then(products => displayByCategory(products))
    .catch(err => alert("Failed to fetch products"));
}

function displayByCategory(products) {
  const categories = ["electronics", "forher", "forhim", "accessories"];
  categories.forEach(cat => {
    const div = document.getElementById(cat);
    if (div) {
      div.innerHTML = "<div class='row'></div>";
      const row = div.querySelector(".row");
      products.filter(p => p.category.toLowerCase() === cat).forEach(p => {
        row.innerHTML += `
          <div class="col-md-3 mb-4">
            <div class="product-card border rounded p-2 text-center">
              <img src="${p.image}" class="img-fluid"><br>
              <strong>${p.name}</strong><br>
              ₹${p.price}<br>
              <button class="btn btn-primary mt-2" onclick="addToCart(${p.id})">Add to Cart</button>
            </div>
          </div>
        `;
      });
    }
  });
}

function addToCart(productId) {
  const token = localStorage.getItem("token");
  if (!token) return alert("Please login first");

  fetch(`${API_URL}/cart/add`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ productId, quantity: 1 })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || data.error);
  })
  .catch(err => alert("Failed to add to cart"));
}

if (window.location.pathname.endsWith("cart.html")) {
  fetchCart();
}


function fetchCart() {
  const token = localStorage.getItem("token");
  if (!token) return alert("Please login first");

  fetch(`${API_URL}/cart`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(cartItems => {
    const div = document.getElementById("cartItems");
    if (!div) return;

    div.innerHTML = "";

    if(cartItems.length === 0) {
      div.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }

    let total = 0;
    cartItems.forEach(item => {
      total += item.price * item.quantity;
      div.innerHTML += `
        <div class="cart-card">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <strong>${item.name}</strong><br>
            ₹${item.price} x ${item.quantity}
          </div>
          <button onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      `;
    });

    div.innerHTML += `<h3>Total: ₹${total}</h3>`;
  })
  .catch(err => alert("Failed to fetch cart items"));
}


function removeFromCart(cartItemId) {
  const token = localStorage.getItem("token");
  if (!token) return alert("Please login first");

  fetch(`${API_URL}/cart/remove/${cartItemId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || data.error);
    fetchCart();
  })
  .catch(err => alert("Failed to remove item"));
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
