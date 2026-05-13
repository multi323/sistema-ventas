const token = localStorage.getItem('token');
if (!token) window.location.href = '/index.html';

const API = 'http://localhost:5000/api';
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

let userProfile = {};
let notifications = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfile();
    initializeEventListeners();
});

async function loadUserProfile() {
    try {
        const res = await fetch(`${API}/auth/perfil`, { headers });
        if (!res.ok) throw new Error('Failed to load profile');
        userProfile = await res.json();
        
        document.getElementById('pageTitle').textContent = userProfile.nombre_negocio || 'Dashboard';
        document.getElementById('pageSubtitle').textContent = `Bienvenido, ${userProfile.nombre_propietario || 'Usuario'}`;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function initializeEventListeners() {
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            
            link.classList.add('active');
            document.getElementById(section).classList.add('active');
            document.getElementById('pageTitle').textContent = link.querySelector('.label').textContent;
        });
    });

    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/index.html';
    });

    document.getElementById('btnNotifications').addEventListener('click', () => {
        alert('Notificaciones: ' + notifications.length);
    });
}