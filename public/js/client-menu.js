// CLIENT MENU JS
const API_URL = 'http://localhost:3000/api';
let shopId = null;
let shopData = null;
let cart = [];
let allProducts = [];
let allCategories = [];

// INIT
window.addEventListener('load', async () => {
    const params = new URLSearchParams(window.location.search);
    shopId = params.get('shop');
    
    if (!shopId) {
        alert('No se especificó tienda');
        return;
    }
    
    await loadShopData();
    await loadCategories();
    await loadProducts();
    setupEventListeners();
    renderCart();
});

// LOAD SHOP DATA
async function loadShopData() {
    try {
        // Simular carga de datos del negocio
        // En producción, esto vendría de una API pública
        document.getElementById('shopName').textContent = 'Mi Negocio';
    } catch (err) {
        console.error('Error:', err);
    }
}

// LOAD CATEGORIES
async function loadCategories() {
    try {
        // Simulación de categorías
        allCategories = [
            { id: 1, name: 'Hamburguesas' },
            { id: 2, name: 'Pizzas' },
            { id: 3, name: 'Bebidas' }
        ];
        
        const nav = document.getElementById('categoriesNav');
        nav.innerHTML = allCategories.map(cat => `
            <button class="category-btn ${cat.id === 1 ? 'active' : ''}" data-category="${cat.id}">
                ${cat.name}
            </button>
        `).join('');
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', filterByCategory);
        });
    } catch (err) {
        console.error('Error:', err);
    }
}

// LOAD PRODUCTS
async function loadProducts() {
    try {
        // Simulación de productos
        allProducts = [
            { id: 1, name: 'Hamburguesa Clásica', price: 25000, category: 1, description: 'Pan, carne, queso, lechuga, tomate', image: 'https://via.placeholder.com/250x200?text=Hamburguesa' },
            { id: 2, name: 'Hamburguesa Doble', price: 35000, category: 1, description: 'Doble carne con extra queso', image: 'https://via.placeholder.com/250x200?text=Doble' },
            { id: 3, name: 'Pizza Margherita', price: 30000, category: 2, description: 'Queso, tomate, oregáno', image: 'https://via.placeholder.com/250x200?text=Pizza' },
            { id: 4, name: 'Refresco Pequeño', price: 5000, category: 3, description: 'Soda, jugo o agua', image: 'https://via.placeholder.com/250x200?text=Bebida' }
        ];
        
        renderProducts(allProducts);
    } catch (err) {
        console.error('Error:', err);
    }
}

// RENDER PRODUCTS
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = products.map(prod => `
        <div class="product-card" data-product="${prod.id}">
            <img src="${prod.image}" alt="${prod.name}" class="product-image">
            <div class="product-info">
                <h3>${prod.name}</h3>
                <p>${prod.description}</p>
                <div class="product-price">$${prod.price.toLocaleString()}</div>
                <div class="product-controls">
                    <div class="quantity-control">
                        <button type="button" onclick="decreaseQty(${prod.id})">-</button>
                        <input type="number" value="1" min="1" max="99" id="qty-${prod.id}" readonly>
                        <button type="button" onclick="increaseQty(${prod.id})">+</button>
                    </div>
                    <button class="add-to-cart" onclick="addToCart(${prod.id})">Añadir</button>
                </div>
            </div>
        </div>
    `).join('');
}

// FILTER BY CATEGORY
function filterByCategory(e) {
    const categoryId = parseInt(e.target.dataset.category);
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    const filtered = allProducts.filter(p => p.category === categoryId);
    renderProducts(filtered);
}

// CART FUNCTIONS
function getQty(productId) {
    const input = document.getElementById(`qty-${productId}`);
    return input ? parseInt(input.value) : 1;
}

function increaseQty(productId) {
    const input = document.getElementById(`qty-${productId}`);
    if (input && input.value < 99) {
        input.value = parseInt(input.value) + 1;
    }
}

function decreaseQty(productId) {
    const input = document.getElementById(`qty-${productId}`);
    if (input && input.value > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    const qty = getQty(productId);
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: qty
        });
    }
    
    renderCart();
    
    // Reset quantity input
    const input = document.getElementById(`qty-${productId}`);
    if (input) input.value = 1;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
}

function updateCartQty(productId, qty) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity = Math.max(1, qty);
        renderCart();
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty">Sin productos</p>';
        cartCount.textContent = '0';
        cartTotal.textContent = '$0';
        checkoutBtn.disabled = true;
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        return `
            <div class="cart-item">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                <div class="cart-item-controls">
                    <button onclick="updateCartQty(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}x</span>
                    <button onclick="updateCartQty(${item.id}, ${item.quantity + 1})">+</button>
                    <button onclick="removeFromCart(${item.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
    
    cartCount.textContent = cart.length;
    cartTotal.textContent = '$' + total.toLocaleString();
    checkoutBtn.disabled = false;
}

// CHECKOUT
function setupEventListeners() {
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }
        openCheckout();
    });
    
    document.getElementById('checkoutForm').addEventListener('submit', submitOrder);
    document.getElementById('deliveryNeeded').addEventListener('change', toggleAddress);
}

function openCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.add('show');
    
    // Render order summary
    const summary = document.getElementById('orderSummary');
    let total = 0;
    let html = '';
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `
            <div class="order-summary-item">
                <span>${item.quantity}x ${item.name}</span>
                <span>$${subtotal.toLocaleString()}</span>
            </div>
        `;
    });
    
    summary.innerHTML = html;
    document.getElementById('summaryTotal').textContent = total.toLocaleString();
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('show');
}

function toggleAddress() {
    const deliveryNeeded = document.getElementById('deliveryNeeded').value === '1';
    const addressGroup = document.getElementById('addressGroup');
    addressGroup.style.display = deliveryNeeded ? 'block' : 'none';
}

async function submitOrder(e) {
    e.preventDefault();
    
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const deliveryNeeded = parseInt(document.getElementById('deliveryNeeded').value);
    const address = document.getElementById('deliveryAddress').value;
    const notes = document.getElementById('notes').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!name || !phone) {
        alert('Por favor completa nombre y teléfono');
        return;
    }
    
    if (deliveryNeeded && !address) {
        alert('Por favor ingresa la dirección');
        return;
    }
    
    let totalAmount = 0;
    cart.forEach(item => {
        totalAmount += item.price * item.quantity;
    });
    
    try {
        const response = await fetch(`${API_URL}/orders/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: shopId,
                clientName: name,
                clientPhone: phone,
                items: cart,
                totalAmount: totalAmount,
                deliveryNeeded: deliveryNeeded,
                deliveryAddress: address,
                notes: notes,
                paymentMethod: paymentMethod
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`🎆 Pedido creado exitosamente!\nNúmero: ${data.orderNumber}\n\nEn breve recibirás confirmación por WhatsApp`);
            cart = [];
            document.getElementById('checkoutForm').reset();
            closeCheckout();
            renderCart();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (err) {
        alert('Error de conexión: ' + err.message);
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            document.getElementById('deliveryAddress').value = `Lat: ${latitude}, Lng: ${longitude}`;
        }, (err) => {
            alert('No se pudo obtener ubicación: ' + err.message);
        });
    } else {
        alert('Tu navegador no soporta geolocalización');
    }
}
