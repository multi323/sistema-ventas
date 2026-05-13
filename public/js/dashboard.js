const API_BASE = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let userId = localStorage.getItem('userId');
let businessName = localStorage.getItem('businessName');

if (!token) {
  window.location.href = 'index.html';
}

// Configurar header
document.getElementById('businessNameHeader').textContent = businessName;

// Navegación de secciones
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    e.target.classList.add('active');
    const section = e.target.dataset.section + 'Section';
    document.getElementById(section)?.classList.add('active');
  });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (e) {}
  
  localStorage.clear();
  window.location.href = 'index.html';
});

// Profile button
document.getElementById('profileBtn').addEventListener('click', () => {
  document.getElementById('profileModal').classList.add('active');
  loadProfile();
});

function closeProfile() {
  document.getElementById('profileModal').classList.remove('active');
}

function closeNotifications() {
  document.getElementById('notificationsModal').classList.remove('active');
}

// Load profile data
async function loadProfile() {
  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const user = await response.json();
    
    document.getElementById('businessNameInput').value = user.businessName;
    document.getElementById('businessPhone').value = user.businessPhone || '';
    document.getElementById('businessAddress').value = user.businessAddress || '';
    document.getElementById('openTime').value = user.openTime || '';
    document.getElementById('closeTime').value = user.closeTime || '';
    document.getElementById('primaryColor').value = user.businessColors?.primary || '#00ff88';
    
    if (user.businessLogo) {
      document.getElementById('logoPreview').src = user.businessLogo;
      document.getElementById('userLogo').src = user.businessLogo;
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// Profile form submission
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    businessName: document.getElementById('businessNameInput').value,
    businessPhone: document.getElementById('businessPhone').value,
    businessAddress: document.getElementById('businessAddress').value,
    openTime: document.getElementById('openTime').value,
    closeTime: document.getElementById('closeTime').value,
    businessColors: { primary: document.getElementById('primaryColor').value }
  };
  
  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      playNotificationSound();
      alert('✅ Perfil actualizado correctamente');
      localStorage.setItem('businessName', formData.businessName);
      document.getElementById('businessNameHeader').textContent = formData.businessName;
      closeProfile();
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al actualizar perfil');
  }
});

// Load dashboard stats
async function loadStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tomorrowStart = new Date(today);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    
    const response = await fetch(`${API_BASE}/business/stats?startDate=${today}T00:00:00&endDate=${tomorrowStart.toISOString().split('T')[0]}T23:59:59`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const stats = await response.json();
    
    document.getElementById('todayOrdersCount').textContent = stats.totalOrders || 0;
    document.getElementById('todayRevenueCount').textContent = '$' + (stats.totalRevenue || 0).toLocaleString();
    document.getElementById('averageOrderCount').textContent = '$' + (stats.averageOrder || 0).toFixed(0).toLocaleString();
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load orders
async function loadOrders() {
  try {
    const response = await fetch(`${API_BASE}/orders/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const orders = await response.json();
    const statuses = ['pendiente', 'preparacion', 'enviado', 'entregado', 'cancelado'];
    
    statuses.forEach(status => {
      const container = document.getElementById(status);
      container.innerHTML = '';
      
      orders
        .filter(order => order.status === status)
        .forEach(order => {
          const html = `
            <div class="order-item" onclick="viewOrder(${order.id})">
              <div class="item-header">
                <span class="item-number">#${order.orderNumber}</span>
                <span class="item-time">${new Date(order.createdAt).toLocaleTimeString()}</span>
              </div>
              <div class="item-customer">👤 ${order.clientName}</div>
              <div class="item-customer">📱 ${order.clientPhone}</div>
              <div class="item-amount">💰 $${order.totalAmount.toLocaleString()}</div>
              ${order.notes ? `<div class="item-note">📝 ${order.notes}</div>` : ''}
            </div>
          `;
          container.innerHTML += html;
        });
    });
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

// Load recent orders
async function loadRecentOrders() {
  try {
    const response = await fetch(`${API_BASE}/orders/?limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const orders = await response.json();
    const list = document.getElementById('recentOrdersList');
    list.innerHTML = '';
    
    orders.forEach(order => {
      const html = `
        <div class="order-card" onclick="viewOrder(${order.id})">
          <div class="order-number">#${order.orderNumber}</div>
          <div class="order-customer">👤 ${order.clientName}</div>
          <div class="order-amount">💰 $${order.totalAmount.toLocaleString()}</div>
          <div class="order-customer" style="font-size: 0.8em; color: var(--accent);">${order.status}</div>
        </div>
      `;
      list.innerHTML += html;
    });
  } catch (error) {
    console.error('Error loading recent orders:', error);
  }
}

// View order details
function viewOrder(orderId) {
  alert('📋 Detalle del pedido ' + orderId + ' - Feature próximamente');
}

// Load notifications
async function loadNotifications() {
  try {
    const response = await fetch(`${API_BASE}/business/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const notifications = await response.json();
    const unreadCount = notifications.filter(n => !n.read).length;
    
    document.getElementById('notifCount').textContent = unreadCount;
    
    const list = document.getElementById('notificationsList');
    list.innerHTML = '';
    
    notifications.forEach(notif => {
      const html = `
        <div class="notification-item ${notif.read ? '' : 'unread'}" onclick="markAsRead(${notif.id})">
          <div>${notif.message}</div>
          <div class="notification-time">${new Date(notif.createdAt).toLocaleString()}</div>
        </div>
      `;
      list.innerHTML += html;
    });
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

function markAsRead(notifId) {
  fetch(`${API_BASE}/business/notifications/${notifId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

// Notifications button
document.getElementById('notifBtn').addEventListener('click', () => {
  document.getElementById('notificationsModal').classList.add('active');
  loadNotifications();
});

// Add table
function addTable() {
  const tableNumber = prompt('Número de mesa:');
  const capacity = prompt('Capacidad:');
  
  if (tableNumber && capacity) {
    fetch(`${API_BASE}/tables/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tableNumber, capacity })
    }).then(() => {
      loadTables();
      playNotificationSound();
    });
  }
}

// Load tables
async function loadTables() {
  try {
    const response = await fetch(`${API_BASE}/tables/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const tables = await response.json();
    const list = document.getElementById('tablesList');
    list.innerHTML = '';
    
    tables.forEach(table => {
      const html = `
        <div class="table-card ${table.occupied ? 'occupied' : ''}">
          <div class="table-number">🪑 ${table.tableNumber}</div>
          <div class="table-status">${table.occupied ? '🔴 Ocupada' : '🟢 Disponible'}</div>
          <small>Cap: ${table.capacity}</small>
        </div>
      `;
      list.innerHTML += html;
    });
  } catch (error) {
    console.error('Error loading tables:', error);
  }
}

// Notification sound
function playNotificationSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  
  oscillator.frequency.value = 1000;
  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}

// Initialize
window.addEventListener('load', () => {
  loadStats();
  loadOrders();
  loadRecentOrders();
  loadTables();
  
  // Refresh data every 5 seconds
  setInterval(() => {
    loadStats();
    loadOrders();
    loadRecentOrders();
    loadNotifications();
  }, 5000);
});

// Tab switching for menu management
const tabs = ['info', 'categories', 'products', 'payments', 'menu-view'];
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    const tabId = btn.dataset.tab + 'Tab';
    document.getElementById(tabId)?.classList.add('active');
  });
});

// Close modals on outside click
window.addEventListener('click', (e) => {
  const profileModal = document.getElementById('profileModal');
  const notifModal = document.getElementById('notificationsModal');
  
  if (e.target === profileModal) profileModal.classList.remove('active');
  if (e.target === notifModal) notifModal.classList.remove('active');
});