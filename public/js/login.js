// Estado de la aplicación
let isLogin = true; // true = login, false = registro
let rememberMe = false;

// Cargar credenciales guardadas
window.addEventListener('DOMContentLoaded', () => {
  const savedEmail = localStorage.getItem('savedEmail');
  const savedPassword = localStorage.getItem('savedPassword');
  
  if (savedEmail) {
    document.getElementById('loginEmail').value = savedEmail;
    document.getElementById('rememberPassword').checked = true;
  }
  
  if (savedPassword) {
    document.getElementById('loginPassword').value = savedPassword;
  }
});

// Alternar entre Login y Registro
function toggleForm() {
  isLogin = !isLogin;
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginBtn = document.querySelector('[data-form="login"]');
  const registerBtn = document.querySelector('[data-form="register"]');
  
  if (isLogin) {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    loginBtn.classList.add('active');
    registerBtn.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    loginBtn.classList.remove('active');
    registerBtn.classList.add('active');
  }
}

// LOGIN
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const remember = document.getElementById('rememberPassword').checked;
  
  if (!email || !password) {
    showAlert('Por favor completa todos los campos', 'danger');
    return;
  }
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showAlert(data.error || 'Error al iniciar sesión', 'danger');
      return;
    }
    
    // Guardar token y datos del usuario
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Guardar credenciales si lo desea
    if (remember) {
      localStorage.setItem('savedEmail', email);
      localStorage.setItem('savedPassword', password);
    } else {
      localStorage.removeItem('savedEmail');
      localStorage.removeItem('savedPassword');
    }
    
    showAlert('¡Bienvenido! Redirigiendo...', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1000);
  } catch (error) {
    showAlert('Error de conexión: ' + error.message, 'danger');
  }
}

// REGISTRO
async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const businessName = document.getElementById('businessName').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (!email || !password || !businessName || !confirmPassword) {
    showAlert('Por favor completa todos los campos', 'danger');
    return;
  }
  
  if (password !== confirmPassword) {
    showAlert('Las contraseñas no coinciden', 'danger');
    return;
  }
  
  if (password.length < 6) {
    showAlert('La contraseña debe tener al menos 6 caracteres', 'danger');
    return;
  }
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, businessName })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showAlert(data.error || 'Error al registrar', 'danger');
      return;
    }
    
    showAlert('¡Registro exitoso! Ahora inicia sesión', 'success');
    
    // Limpiar formulario
    document.getElementById('registerForm').reset();
    
    // Cambiar a login
    setTimeout(() => {
      isLogin = true;
      document.getElementById('loginForm').style.display = 'block';
      document.getElementById('registerForm').style.display = 'none';
      document.getElementById('loginEmail').value = email;
    }, 1500);
  } catch (error) {
    showAlert('Error de conexión: ' + error.message, 'danger');
  }
}

// Mostrar alertas
function showAlert(message, type = 'info') {
  // Crear elemento de alerta
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span>${message}</span>
  `;
  
  // Agregar al DOM
  const container = document.body.appendChild(alert);
  
  // Auto-remover después de 3 segundos
  setTimeout(() => {
    alert.remove();
  }, 3000);
}

// Google Login (placeholder)
function loginWithGoogle() {
  showAlert('Google login será implementado próximamente', 'warning');
  // Aquí irá la integración real con Google
}
