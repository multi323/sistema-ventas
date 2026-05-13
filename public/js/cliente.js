const API = 'http://localhost:5000/api';
let carrito = [];
let negocio = {};

document.addEventListener('DOMContentLoaded', async () => {
    const usuarioId = new URLSearchParams(window.location.search).get('usuario');
    if (!usuarioId) {
        alert('ID de usuario inválido');
        return;
    }

    await cargarConfiguracionNegocio(usuarioId);
    await cargarCategorias(usuarioId);
    await cargarProductos(usuarioId);
    inicializarEventListeners();
});

async function cargarConfiguracionNegocio(usuarioId) {
    try {
        const res = await fetch(`${API}/config/publico/${usuarioId}`);
        if (res.ok) {
            negocio = await res.json();
            document.getElementById('nombreNegocio').textContent = negocio.nombre || 'Mi Negocio';
            document.getElementById('logo').src = negocio.logo || 'https://via.placeholder.com/50';
            verificarHorario();
        }
    } catch (error) {
        console.error('Error al cargar configuración:', error);
    }
}

async function cargarCategorias(usuarioId) {
    try {
        const res = await fetch(`${API}/productos/categorias?usuario=${usuarioId}&visible=true`);
        if (res.ok) {
            const categorias = await res.json();
            const lista = document.getElementById('categoriasList');
            lista.innerHTML = '';
            
            categorias.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'categoria-btn';
                btn.textContent = cat.nombre;
                btn.addEventListener('click', () => filtrarPorCategoria(cat.id, usuarioId));
                lista.appendChild(btn);
            });
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

async function cargarProductos(usuarioId, categoriaId = null) {
    try {
        let url = `${API}/productos/productos?usuario=${usuarioId}&visible=true`;
        if (categoriaId) url += `&categoria=${categoriaId}`;
        
        const res = await fetch(url);
        if (res.ok) {
            const productos = await res.json();
            mostrarProductos(productos);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function mostrarProductos(productos) {
    const grid = document.getElementById('productosGrid');
    grid.innerHTML = '';
    
    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.innerHTML = `
            <img src="${producto.imagen || 'https://via.placeholder.com/200x150'}" alt="${producto.nombre}" class="producto-imagen">
            <div class="producto-info">
                <div class="producto-nombre">${producto.nombre}</div>
                <div class="producto-descripcion">${producto.descripcion || ''}</div>
                <div class="producto-footer">
                    <div class="producto-precio">$${parseFloat(producto.precio).toFixed(2)}</div>
                    <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id}, '${producto.nombre}', ${producto.precio})">
                        + Agregar
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filtrarPorCategoria(categoriaId, usuarioId) {
    document.querySelectorAll('.categoria-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    cargarProductos(usuarioId, categoriaId);
}

function agregarAlCarrito(productoId, nombre, precio) {
    const item = carrito.find(i => i.id === productoId);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ id: productoId, nombre, precio, cantidad: 1 });
    }
    actualizarCarrito();
}

function actualizarCarrito() {
    document.querySelector('.carrito-count').textContent = carrito.length;
    
    const carritoItems = document.getElementById('carritoItems');
    carritoItems.innerHTML = '';
    
    let subtotal = 0;
    carrito.forEach(item => {
        const total = item.precio * item.cantidad;
        subtotal += total;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'carrito-item';
        itemEl.innerHTML = `
            <div>
                <div class="item-nombre">${item.nombre}</div>
                <div style="font-size: 11px; color: var(--text-muted);">x${item.cantidad}</div>
            </div>
            <div class="item-precio">$${total.toFixed(2)}</div>
        `;
        carritoItems.appendChild(itemEl);
    });
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`;
}

function verificarHorario() {
    if (!negocio.hora_apertura || !negocio.hora_cierre) return;
    
    const ahora = new Date();
    const [aperturaH, aperturaM] = negocio.hora_apertura.split(':');
    const [cierreH, cierreM] = negocio.hora_cierre.split(':');
    
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    const apertura = parseInt(aperturaH) * 60 + parseInt(aperturaM);
    const cierre = parseInt(cierreH) * 60 + parseInt(cierreM);
    
    const abierto = horaActual >= apertura && horaActual <= cierre;
    const estado = document.getElementById('estadoNegocio');
    
    if (abierto) {
        estado.classList.add('estado-abierto');
        estado.classList.remove('estado-cerrado');
        estado.textContent = '🟢 Abierto';
    } else {
        estado.classList.add('estado-cerrado');
        estado.classList.remove('estado-abierto');
        estado.textContent = '🔴 Cerrado';
    }
}

function inicializarEventListeners() {
    document.querySelector('.btn-carrito').addEventListener('click', () => {
        document.querySelector('.modal-carrito').classList.add('active');
    });
    
    document.querySelector('.btn-cerrar-carrito').addEventListener('click', () => {
        document.querySelector('.modal-carrito').classList.remove('active');
    });
    
    document.querySelector('.btn-proceder-pago').addEventListener('click', () => {
        if (carrito.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        alert('🎉 Funcionalidad de pago integrada con WhatsApp');
        document.querySelector('.modal-carrito').classList.remove('active');
    });
}