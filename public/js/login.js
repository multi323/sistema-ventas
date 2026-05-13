// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const rememberPassword = document.getElementById('rememberPassword');
const rememberEmail = document.getElementById('rememberEmail');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const businessName = document.getElementById('businessName');
const errorMessage = document.getElementById('errorMessage');
const tabBtns = document.querySelectorAll('.tab-btn');
const formSections = document.querySelectorAll('.form-section');

// API URL
const API_URL = 'http://localhost:3000/api';

// TABS
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Deactivar todos los tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        formSections.forEach(f => f.classList.remove('active'));
        
        // Activar el tab seleccionado
        btn.classList.add('active');
        document.getElementById(`${tabName}Form`).classList.add('active');
        
        // Limpiar errores
        hideError();
    });
});

// Cargar datos guardados al abrir
window.addEventListener('load', () => {
    const savedEmail = localStorage.getItem('tilio_email');
    const savedPassword = localStorage.getItem('tilio_password');
    
    if (savedEmail) {
        loginEmail.value = savedEmail;
        rememberEmail.checked = true;
    }
    
    if (savedPassword) {
        loginPassword.value = savedPassword;
        rememberPassword.checked = true;
    }
});

// LOGIN
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    
    if (!email || !password) {
        showError('Por favor completa todos los campos');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showError(data.error || 'Error al iniciar sesión');
            return;
        }
        
        // Guardar token
        localStorage.setItem('tilio_token', data.token);
        localStorage.setItem('tilio_user', JSON.stringify(data.user));
        
        // Guardar credenciales si está marcado
        if (rememberEmail.checked) {
            localStorage.setItem('tilio_email', email);
        } else {
            localStorage.removeItem('tilio_email');
        }
        
        if (rememberPassword.checked) {
            localStorage.setItem('tilio_password', password);
        } else {
            localStorage.removeItem('tilio_password');
        }
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 500);
        
    } catch (err) {
        showError('Error de conexión: ' + err.message);
    }
});

// REGISTRO
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const business = businessName.value.trim();
    
    if (!email || !password || !business) {
        showError('Por favor completa todos los campos');
        return;
    }
    
    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, businessName: business })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showError(data.error || 'Error al registrarse');
            return;
        }
        
        // Guardar token
        localStorage.setItem('tilio_token', data.token);
        localStorage.setItem('tilio_user', JSON.stringify(data.user));
        
        // Mostrar mensaje de éxito
        showSuccess('✅ Cuenta creada exitosamente. Redirigiendo...');
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
        
    } catch (err) {
        showError('Error de conexión: ' + err.message);
    }
});

// Funciones auxiliares
function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add('show');
    errorMessage.style.background = '#ff4444';
    errorMessage.style.color = 'white';
}

function showSuccess(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add('show');
    errorMessage.style.background = '#00ff88';
    errorMessage.style.color = '#000';
}

function hideError() {
    errorMessage.classList.remove('show');
}
