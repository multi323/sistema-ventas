// CONFIG
const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let authToken = null;

// DOM ELEMENTS
const sidebar = document.querySelector('.sidebar');
const menuItems = document.querySelectorAll('.menu-item');
const pages = document.querySelectorAll('.page');
const menuTabs = document.querySelectorAll('.menu-tab');
const menuSections = document.querySelectorAll('.menu-section');
const logoutBtn = document.getElementById('logoutBtn');
const menuToggle = document.getElementById('menuToggle');
const notificationBtn = document.getElementById('notificationBtn');
const notificationDropdown = document.getElementById('notificationDropdown');
const profileBtn = document.querySelector('.profile-btn');
const toast = document.getElementById('toast');

// INICIALIZACION
window.addEventListener('load', () => {
    authToken = localStorage.getItem('tilio_token');
    const userData = localStorage.getItem('tilio_user');
    
    if (!authToken || !userData) {
        window.location.href = '/index.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    loadUserData();
    loadDashboard();
    setupEventListeners();
    loadStats();
    loadRecentOrders();
});

// LOAD USER DATA
function loadUserData() {
    document.getElementById('businessName').textContent = currentUser.businessName || 'Negocio';
    document.getElementById('userEmail').textContent = currentUser.email;
    if (currentUser.businessLogo) {
        document.getElementById('userLogo').src = currentUser.businessLogo;
    }
}

// SETUP EVENT LISTENERS
function setupEventListeners() {
    // Menu items
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            showPage(page);
            
            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Menu tabs
    menuTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.menuTab;
            menuTabs.forEach(t => t.classList.remove('active'));
            menuSections.forEach(s => s.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            if (tabName === 'categories') loadCategories();
            if (tabName === 'products') loadProducts();
            if (tabName === 'payments') loadPayments();
            if (tabName === 'tables') loadTables();
            if (tabName === 'info') loadBusinessInfo();
        });
    });
    
    // Logout
    logoutBtn.addEventListener('click', logout);
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
    
    // Notifications
    notificationBtn.addEventListener('click', () => {
        notificationDropdown.classList.toggle('show');
    });
    
    // Profile
    profileBtn.addEventListener('click', () => {
        openModal('profileModal');
    });
    
    // Filter tags
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            const status = tag.dataset.status;
            loadOrders(status);
        });
    });
    
    // Business form
    document.getElementById('businessForm')?.addEventListener('submit', updateBusinessInfo);
    document.getElementById('changePasswordBtn')?.addEventListener('click', () => openModal('passwordModal'));
    document.getElementById('passwordForm')?.addEventListener('submit', changePassword);
    
    // Products
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => openCategoryModal());
    document.getElementById('addProductBtn')?.addEventListener('click', () => openProductModal());
    document.getElementById('addPaymentBtn')?.addEventListener('click', () => openPaymentModal());
    document.getElementById('addTableBtn')?.addEventListener('click', () => openTableModal());
    
    // Refresh button
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        loadStats();
        loadRecentOrders();
        showToast('Datos actualizados', 'success');
    });
    
    // Carta
    document.getElementById('copyCarta')?.addEventListener('click', copyCarta);
    
    // Orders actions
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'view-orders') showPage('orders');
            if (action === 'view-revenue') showPage('orders');
            if (action === 'view-all') showPage('orders');
        });
    });
}

// PAGES
function showPage(pageName) {
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(pageName + 'Page').classList.add('active');
    
    const pageTitle = {
        'home': 'Dashboard',
        'orders': 'Tablero de Pedidos',
        'menu': 'Gestión de Menú',
        'kitchen': 'Cocina',
        'delivery': 'Delivery'
    };
    
    document.getElementById('pageTitle').textContent = pageTitle[pageName] || 'Dashboard';
    
    if (pageName === 'orders') loadKanbanBoard();
    if (pageName === 'kitchen') loadKitchenBoard();
}

// STATS
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/orders/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('ordersToday').textContent = data.stats.ordersToday;
            document.getElementById('revenueToday').textContent = '$' + data.stats.revenueToday.toLocaleString();
            document.getElementById('totalOrders').textContent = data.stats.totalOrders;
        }
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

// RECENT ORDERS
async function loadRecentOrders() {
    try {
        const response = await fetch(`${API_URL}/orders/list?status=`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const list = document.getElementById('recentOrdersList');
            const orders = data.orders.slice(0, 5);
            
            if (orders.length === 0) {
                list.innerHTML = '<p class="empty">Sin pedidos aún</p>';
                return;
            }
            
            list.innerHTML = orders.map(order => `
                <div class="order-item" onclick="viewOrder(${order.id})">
                    <div class="order-item-info">
                        <h4>Pedido #${order.orderNumber}</h4>
                        <small>${order.clientName} • ${new Date(order.createdAt).toLocaleString()}</small>
                    </div>
                    <div class="order-item-status">${order.status.toUpperCase()}</div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error loading recent orders:', err);
    }
}

// KANBAN BOARD
async function loadKanbanBoard() {
    try {
        const response = await fetch(`${API_URL}/orders/list`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const statuses = ['pendiente', 'preparacion', 'enviado', 'entregado', 'cancelado'];
            const statusLabels = {
                'pendiente': '⏳ Pendientes',
                'preparacion': '🍳 En Preparación',
                'enviado': '🚚 Enviado',
                'entregado': '✅ Entregado',
                'cancelado': '❌ Cancelado'
            };
            
            let html = '';
            statuses.forEach(status => {
                const orders = data.orders.filter(o => o.status === status);
                html += `
                    <div class="kanban-column">
                        <div class="kanban-title">${statusLabels[status]} (${orders.length})</div>
                        <div class="kanban-cards">
                            ${orders.map(order => `
                                <div class="kanban-card" onclick="viewOrder(${order.id})">
                                    <div class="kanban-card-header">
                                        <div class="kanban-card-number">#${order.orderNumber}</div>
                                    </div>
                                    <div class="kanban-card-info">${order.clientName}</div>
                                    <div class="kanban-card-info">${order.clientPhone}</div>
                                    <div class="kanban-card-amount">$${order.totalAmount}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
            
            document.getElementById('kanbanBoard').innerHTML = html;
        }
    } catch (err) {
        console.error('Error loading kanban:', err);
    }
}

// ORDERS LIST
async function loadOrders(status = '') {
    try {
        const url = status ? `${API_URL}/orders/list?status=${status}` : `${API_URL}/orders/list`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            loadKanbanBoard();
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

// KITCHEN BOARD
async function loadKitchenBoard() {
    try {
        const response = await fetch(`${API_URL}/orders/list?status=preparacion`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const board = document.getElementById('kitchenBoard');
            if (data.orders.length === 0) {
                board.innerHTML = '<p class="empty">Sin pedidos en preparación</p>';
                return;
            }
            
            board.innerHTML = data.orders.map(order => `
                <div class="order-ticket">
                    <h3>Pedido #${order.orderNumber}</h3>
                    <p><strong>${order.clientName}</strong></p>
                    <p>Mesa: ${order.tableId || 'Delivery'}</p>
                    <div style="border-top: 1px solid #ccc; margin: 10px 0; padding-top: 10px;">
                        ${JSON.parse(order.items).map(item => `
                            <p>${item.quantity}x ${item.name}</p>
                        `).join('')}
                    </div>
                    <p><strong>Nota:</strong> ${order.notes || 'Sin notas'}</p>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

// BUSINESS INFO
async function loadBusinessInfo() {
    try {
        const response = await fetch(`${API_URL}/business/info`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const b = data.business;
            document.getElementById('businessNameInput').value = b.businessName || '';
            document.getElementById('businessPhoneInput').value = b.businessPhone || '';
            document.getElementById('businessAddressInput').value = b.businessAddress || '';
            document.getElementById('openTimeInput').value = b.openTime || '';
            document.getElementById('closeTimeInput').value = b.closeTime || '';
            document.getElementById('currencyInput').value = b.currency || 'COP';
            
            if (b.businessLogo) {
                document.getElementById('logoPreview').src = b.businessLogo;
            }
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

// UPDATE BUSINESS
async function updateBusinessInfo(e) {
    e.preventDefault();
    
    try {
        const logoInput = document.getElementById('logoInput');
        let logoBase64 = '';
        
        if (logoInput.files.length > 0) {
            const file = logoInput.files[0];
            logoBase64 = await fileToBase64(file);
        }
        
        const payload = {
            businessName: document.getElementById('businessNameInput').value,
            businessPhone: document.getElementById('businessPhoneInput').value,
            businessAddress: document.getElementById('businessAddressInput').value,
            businessLogo: logoBase64 || currentUser.businessLogo,
            openTime: document.getElementById('openTimeInput').value,
            closeTime: document.getElementById('closeTimeInput').value,
            currency: document.getElementById('currencyInput').value,
            businessColors: {}
        };
        
        const response = await fetch(`${API_URL}/business/info`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Información actualizada', 'success');
            loadUserData();
        } else {
            showToast(data.error, 'error');
        }
    } catch (err) {
        showToast('Error al actualizar', 'error');
    }
}

// CHANGE PASSWORD
async function changePassword(e) {
    e.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/business/change-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });
        
        const data = await response.json();
        if (data.success) {
            showToast('Contraseña actualizada', 'success');
            closeModal('passwordModal');
            document.getElementById('passwordForm').reset();
        } else {
            showToast(data.error, 'error');
        }
    } catch (err) {
        showToast('Error al cambiar contraseña', 'error');
    }
}

// CATEGORIES
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/products/categories`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const list = document.getElementById('categoriesList');
            if (data.categories.length === 0) {
                list.innerHTML = '<p class="empty">Sin categorías</p>';
                return;
            }
            
            list.innerHTML = data.categories.map(cat => `
                <div class="category-item">
                    <div>
                        <h4>${cat.name}</h4>
                        ${cat.image ? `<img src="${cat.image}" style="max-width: 100px;">` : ''}
                    </div>
                    <div class="actions">
                        <button onclick="editCategory(${cat.id})">✏️</button>
                        <button onclick="deleteCategory(${cat.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

// PRODUCTS
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products/products`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const list = document.getElementById('productsList');
            if (data.products.length === 0) {
                list.innerHTML = '<p class="empty">Sin productos</p>';
                return;
            }
            
            list.innerHTML = data.products.map(prod => `
                <div class="product-item">
                    <div class="product-info">
                        ${prod.image ? `<img src="${prod.image}" style="max-width: 80px;">` : ''}
                        <div>
                            <h4>${prod.name}</h4>
                            <p>$${prod.price}</p>
                            <small>${prod.categoryName}</small>
                        </div>
                    </div>
                    <div class="actions">
                        <button onclick="editProduct(${prod.id})">✏️</button>
                        <button onclick="duplicateProduct(${prod.id})">📋</button>
                        <button onclick="deleteProduct(${prod.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

// PAYMENTS
async function loadPayments() {
    try {
        const response = await fetch(`${API_URL}/payments/admin/all`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const list = document.getElementById('paymentsList');
            if (data.payments.length === 0) {
                list.innerHTML = '<p class="empty">Sin métodos de pago</p>';
                return;
            }
            
            list.innerHTML = data.payments.map(pay => `
                <div class="payment-item">
                    <div>
                        <h4>${pay.name}</h4>
                        <p>${pay.accountNumber}</p>
                    </div>
                    <div class="actions">
                        <button onclick="editPayment(${pay.id})">✏️</button>
                        <button onclick="deletePayment(${pay.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

// TABLES
async function loadTables() {
    try {
        const response = await fetch(`${API_URL}/tables`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const grid = document.getElementById('tablesGrid');
            if (data.tables.length === 0) {
                grid.innerHTML = '<p class="empty">Sin mesas configuradas</p>';
                return;
            }
            
            grid.innerHTML = data.tables.map(table => `
                <div class="table-card ${table.occupied ? 'occupied' : ''}">
                    <h4>Mesa ${table.tableNumber}</h4>
                    <p>Capacidad: ${table.capacity}</p>
                    <p>${table.occupied ? '🔴 Ocupada' : '🟢 Disponible'}</p>
                    <div class="actions">
                        <button onclick="editTable(${table.id})">✏️</button>
                        <button onclick="duplicateTable(${table.id})">📋</button>
                        <button onclick="deleteTable(${table.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

// MODALS
function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// UTILITIES
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// LOGOUT
async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
    } catch (err) {
        console.error('Error:', err);
    }
    
    localStorage.removeItem('tilio_token');
    localStorage.removeItem('tilio_user');
    window.location.href = '/index.html';
}

// CARTA LINK
function copyCarta() {
    const link = `${window.location.origin}/client-menu.html?shop=${currentUser.id}`;
    document.getElementById('cartaLink').value = link;
    document.getElementById('cartaLink').select();
    document.execCommand('copy');
    showToast('Enlace copiado', 'success');
}

// DASHBOARD INIT
function loadDashboard() {
    showPage('home');
}

// VIEW ORDER
function viewOrder(orderId) {
    console.log('Ver orden:', orderId);
    // TODO: Implementar modal de detalles de pedido
}

// STUBS PARA CRUD (se implementarán completamente después)
function openCategoryModal() { showToast('Agregar categoría', 'warning'); }
function openProductModal() { showToast('Agregar producto', 'warning'); }
function openPaymentModal() { showToast('Agregar método pago', 'warning'); }
function openTableModal() { showToast('Agregar mesa', 'warning'); }
function editCategory(id) { showToast('Editar categoría', 'warning'); }
function deleteCategory(id) { showToast('Eliminar categoría', 'warning'); }
function editProduct(id) { showToast('Editar producto', 'warning'); }
function deleteProduct(id) { showToast('Eliminar producto', 'warning'); }
function duplicateProduct(id) { showToast('Duplicar producto', 'warning'); }
function editPayment(id) { showToast('Editar pago', 'warning'); }
function deletePayment(id) { showToast('Eliminar pago', 'warning'); }
function editTable(id) { showToast('Editar mesa', 'warning'); }
function deleteTable(id) { showToast('Eliminar mesa', 'warning'); }
function duplicateTable(id) { showToast('Duplicar mesa', 'warning'); }
