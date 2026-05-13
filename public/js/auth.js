const API_BASE = 'http://localhost:3000/api';

// Funciones de Login/Register
function toggleAuth() {
  document.getElementById('loginSection').classList.toggle('active');
  document.getElementById('registerSection').classList.toggle('active');
}

// LOGIN
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe })
    });

    const data = await response.json();

    if (response.ok) {
      // Guardar token
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('businessName', data.businessName);
      
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
        localStorage.setItem('rememberPassword', password); // ⚠️ Solo para demostración
      }

      // Reproducir sonido de éxito
      playSound('success');
      
      // Ir al dashboard
      window.location.href = 'dashboard.html';
    } else {
      alert('❌ ' + data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al conectar con el servidor');
  }
});

// REGISTRO
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const businessName = document.getElementById('businessName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('❌ Las contraseñas no coinciden');
    return;
  }

  if (password.length < 6) {
    alert('❌ La contraseña debe tener al menos 6 caracteres');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, businessName })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('businessName', data.businessName);
      
      playSound('success');
      window.location.href = 'dashboard.html';
    } else {
      alert('❌ ' + data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al registrar');
  }
});

// Google Login (simulado)
function loginWithGoogle() {
  alert('✨ Integración con Google Coming Soon');
}

// Reproducir sonidos
function playSound(type) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  
  if (type === 'success') {
    oscillator.frequency.value = 800;
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
}

// Cargar credenciales recordadas al abrir la página
window.addEventListener('DOMContentLoaded', () => {
  const rememberEmail = localStorage.getItem('rememberEmail');
  if (rememberEmail) {
    document.getElementById('loginEmail').value = rememberEmail;
    document.getElementById('loginPassword').value = localStorage.getItem('rememberPassword');
    document.getElementById('rememberMe').checked = true;
  }
});