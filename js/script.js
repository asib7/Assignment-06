const categoriesContainer = document.querySelector(".sidebar ul");
const productsContainer = document.querySelector(".products");
const cartContainer = document.querySelector(".cart");
const cartList = cartContainer.querySelector("h3").nextElementSibling;
let cart = [];

async function loadCategories() {
  try {
    const res = await fetch(
      "https://openapi.programming-hero.com/api/categories"
    );
    const data = await res.json();
    renderCategories(data.categories);
  } catch (err) {
    console.error("Error loading categories:", err);
  }
}

function renderCategories(categories) {
  categoriesContainer.innerHTML = "";
  const allLi = document.createElement("li");
  allLi.textContent = "All Trees";
  allLi.classList.add("active");
  allLi.onclick = () => loadPlants();
  categoriesContainer.appendChild(allLi);

  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.textContent = cat.category;
    li.onclick = () => loadCategoryPlants(cat.id, li);
    categoriesContainer.appendChild(li);
  });
}

async function loadPlants() {
  showSpinner();
  const res = await fetch("https://openapi.programming-hero.com/api/plants");
  const data = await res.json();
  renderPlants(data.plants);
  hideSpinner();
}

async function loadCategoryPlants(id, li) {
  setActiveCategory(li);
  showSpinner();
  const res = await fetch(
    `https://openapi.programming-hero.com/api/category/${id}`
  );
  const data = await res.json();
  renderPlants(data.data);
  hideSpinner();
}

function renderPlants(plants) {
  productsContainer.innerHTML = "";
  if (!plants.length) {
    productsContainer.innerHTML = `<p>No trees found in this category.</p>`;
    return;
  }

  plants.forEach((plant) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <div class="image-placeholder">
        <img src="${plant.image}" alt="${
      plant.name
    }" style="width:100%; height:100%; object-fit:cover; border-radius:6px;">
      </div>
      <h4 class="plant-name" data-id="${plant.id}">${plant.name}</h4>
      <p>${plant.description.slice(0, 60)}...</p>
      <div class="info-row">
        <span class="tag">${plant.category}</span>
        <span class="price">৳${plant.price}</span>
      </div>
      <button class="add-btn" data-id="${plant.id}" data-name="${
      plant.name
    }" data-price="${plant.price}">Add to Cart</button>
    `;
    productsContainer.appendChild(card);
  });

  // Modal trigger
  document.querySelectorAll(".plant-name").forEach((el) => {
    el.addEventListener("click", () => loadPlantDetail(el.dataset.id));
  });

  // Add to cart
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset));
  });
}

async function loadPlantDetail(id) {
  const res = await fetch(
    `https://openapi.programming-hero.com/api/plant/${id}`
  );
  const data = await res.json();
  showModal(data.plant);
}

function showModal(plant) {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <img src="${plant.image}" alt="${plant.name}" style="width:100%; height:200px; object-fit:cover; border-radius:8px;">
      <h2>${plant.name}</h2>
      <p>${plant.description}</p>
      <p><strong>Category:</strong> ${plant.category}</p>
      <p><strong>Price:</strong> ৳${plant.price}</p>
      <button class="add-btn" onclick="addToCart({id:'${plant.id}',name:'${plant.name}',price:'${plant.price}'})">Add to Cart</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".close").onclick = () => modal.remove();
}

function addToCart(item) {
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((c) => c.id !== id);
  renderCart();
}

function renderCart() {
  const cartItems = cart
    .map(
      (c) => `
    <div class="cart-item">
      <div>
        <strong>${c.name}</strong>
        <p>৳${c.price} × ${c.qty}</p>
      </div>
      <button class="remove-btn" onclick="removeFromCart('${c.id}')">×</button>
    </div>
  `
    )
    .join("");

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  cartContainer.innerHTML = `
    <h3>Your Cart</h3>
    ${cartItems}
    <div class="cart-total">
      <strong>Total:</strong>
      <span>৳${total}</span>
    </div>
  `;
}

function showSpinner() {
  productsContainer.innerHTML = `<div class="spinner">Loading...</div>`;
}

function hideSpinner() {
  document.querySelector(".spinner")?.remove();
}

// ✅ Active Category Highlight
function setActiveCategory(selected) {
  document
    .querySelectorAll(".sidebar li")
    .forEach((li) => li.classList.remove("active"));
  selected.classList.add("active");
}

loadCategories();
loadPlants();
