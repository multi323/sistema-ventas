// Estado global del dashboard
let currentUser = null;
let currentPage = 'dashboard';
let orders = [];
let products = [];
let categories = [];
let notifications = [];

// Verificar autenticación
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  currentUser = user;
  
  // Actualizar UI con datos del usuario
  document.querySelector('.sidebar-title').textContent = user.businessName || 'Mi Negocio';
  document.querySelector('.profile-name').textContent = user.email || 'Usuario';
  document.querySelector('.profile-avatar').textContent = (user.businessName || 'M')[0].toUpperCase();
  
  // Cargar datos del dashboard
  loadDashboardData();
  loadNotifications();
  
  // Event listeners
  setupEventListeners();
});

// Cargar datos del dashboard
async function loadDashboardData() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/business/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    // Actualizar cards
    document.querySelector('[data-card="orders-today"] .card-value').textContent = data.ordersToday || 0;
    document.querySelector('[data-card="income-today"] .card-value').textContent = '$' + (data.incomeToday || 0).toLocaleString();
    document.querySelector('[data-card="total-orders"] .card-value').textContent = data.totalOrders || 0;
    
    // Actualizar tabla de pedidos recientes
    orders = data.recentOrders || [];
    renderRecentOrders();
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
  }
}

// Cargar notificaciones
async function loadNotifications() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/business/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    notifications = await response.json();
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Actualizar badge de notificaciones
    const badge = document.querySelector('.notification-badge');
    if (badge) badge.textContent = unreadCount > 0 ? unreadCount : '';
  } catch (error) {
    console.error('Error al cargar notificaciones:', error);
  }
}

// Renderizar pedidos recientes
function renderRecentOrders() {
  const tbody = document.querySelector('table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>${order.orderNumber}</td>
      <td>${order.clientName}</td>
      <td>$${order.totalAmount.toLocaleString()}</td>
      <td><span class="badge badge-${getStatusBadgeClass(order.status)}">${order.status}</span></td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewOrder(${order.id})">Ver</button>
      </td>
    </tr>
  `).join('');
}

function getStatusBadgeClass(status) {
  const map = {
    'pendiente': 'warning',
    'preparacion': 'primary',
    'enviado': 'secondary',
    'entregado': 'success',
    'cancelado': 'danger'
  };
  return map[status] || 'secondary';
}

// Navegar entre secciones
function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  
  // Cambiar contenido
  const sections = document.querySelectorAll('[data-section]');
  sections.forEach(section => section.style.display = 'none');
  document.querySelector(`[data-section="${page}"]`).style.display = 'block';
}

// Setup de event listeners
function setupEventListeners() {
  // Navegación
  document.querySelectorAll('[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      navigateTo(item.dataset.page);
    });
  });
  
  // Perfil
  document.querySelector('.profile-avatar').addEventListener('click', toggleProfileMenu);
  
  // Notificaciones
  document.querySelector('.notification-icon').addEventListener('click', showNotifications);
  
  // Cerrar menús con click fuera
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.dropdown-menu');
    if (dropdown && !e.target.closest('.profile-section')) {
      dropdown.classList.remove('active');
    }
  });
}

// Toggle perfil
function toggleProfileMenu() {
  const dropdown = document.querySelector('.dropdown-menu');
  dropdown.classList.toggle('active');
}

// Ver notificaciones
function showNotifications() {
  console.log('Notificaciones:', notifications);
}

// Ver pedido
function viewOrder(orderId) {
  console.log('Ver pedido:', orderId);
  // Aquí irá la lógica para ver detalles del pedido
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}
