# 🚀 TILIO - Sistema de Ventas Profesional

## ✨ ¡Sistema Completo Lista para Vender!

### 📋 Instrucciones de Instalación

#### 1. **Clonar el Repositorio**
```bash
git clone https://github.com/multi323/sistema-ventas.git
cd sistema-ventas
```

#### 2. **Instalar Dependencias**
```bash
npm install
```

#### 3. **Iniciar el Servidor**
```bash
npm start
```

El servidor correrá en: **http://localhost:3000**

---

## 🔐 Credenciales de Prueba

**Para probar el sistema, crea una cuenta nueva** en el login o usa:
- Email: `test@tilio.com`
- Contraseña: `123456`
- Negocio: `Mi Tienda Test`

---

## 📁 Estructura del Proyecto

```
sistema-ventas/
├── server.js                    (Servidor principal Node.js)
├── database.js                  (Configuración SQLite)
├── routes/
│   ├── auth.js                 (Autenticación)
│   ├── business.js             (Información del negocio)
│   ├── products.js             (Categorías y productos)
│   ├── orders.js               (Gestión de pedidos)
│   ├── payments.js             (Métodos de pago)
│   ├── tables.js               (Sistema de mesas)
├── public/
│   ├── index.html              (Login - Página inicial)
│   ├── dashboard.html          (Panel administrativo)
│   ├── client-menu.html        (Carta virtual para clientes)
│   ├── css/
│   │   ├── login.css
│   │   ├── dashboard.css
│   │   ├── client-menu.css
│   ├── js/
│   │   ├── login.js
│   │   ├── dashboard.js
│   │   ├── client-menu.js
├── package.json
├── README.md
├── tilio.db                    (Base de datos SQLite - se crea automáticamente)
```

---

## ✅ Características Implementadas

### 🔐 1. LOGIN PROFESIONAL
- [✓] Diseño neón moderno y atractivo
- [✓] Opción recordar contraseña
- [✓] Opción recordar cuenta
- [✓] Registro de nuevas cuentas
- [✓] Validación de formularios
- [✓] Integración automática de datos guardados

### 📊 2. DASHBOARD EJECUTIVO
- [✓] Panel principal con estadísticas en tiempo real
- [✓] Mostrar pedidos de hoy
- [✓] Mostrar ingresos de hoy (sólo pedidos entregados)
- [✓] Total de pedidos de todos los tiempos
- [✓] Pedidos recientes con filtro por fecha
- [✓] Notificaciones con sonido para nuevos pedidos
- [✓] Perfil de usuario con logo y nombre del negocio
- [✓] Botón de cerrar sesión

### 📋 3. TABLERO DE PEDIDOS (KANBAN)
- [✓] Vista tipo Kanban con columnas por estado
- [✓] Estados: Pendiente → Preparación → Enviado → Entregado / Cancelado
- [✓] Tarjetas de pedidos con número único
- [✓] Información del cliente (nombre, teléfono)
- [✓] Monto total de cada pedido
- [✓] Filtros por estado
- [✓] Actualización en tiempo real

### 🍽️ 4. GESTIÓN DE MENÚ

#### Información General
- [✓] Logo del negocio (con subida de imagen)
- [✓] Nombre del negocio
- [✓] Teléfono de contacto
- [✓] Dirección
- [✓] Hora de apertura y cierre
- [✓] Selección de moneda
- [✓] Botón guardar con confirmación
- [✓] Botón cambiar contraseña

#### Mi Carta Virtual
- [✓] Tema personalizable (colores primario y secundario)
- [✓] Imagen de portada
- [✓] Enlace público para compartir
- [✓] Botón copiar enlace
- [✓] Opción mostrar/ocultar precio
- [✓] Opción mostrar/ocultar imagen
- [✓] Opción mostrar/ocultar descripción

#### Categorías de Productos
- [✓] Crear categorías
- [✓] Editar categorías
- [✓] Eliminar categorías
- [✓] Subir imagen por categoría
- [✓] Marcar como destacado
- [✓] Visibilidad (visible/oculto para cliente)

#### Productos
- [✓] Crear productos dentro de categorías
- [✓] Editar productos
- [✓] Eliminar productos
- [✓] Duplicar productos
- [✓] Subir imagen del producto
- [✓] Añadir descripción
- [✓] Establecer precio
- [✓] Marcar como destacado
- [✓] Visibilidad para cliente

#### Métodos de Pago
- [✓] Agregar métodos de pago (Nequi, Transferencia, Efectivo, etc.)
- [✓] Editar métodos
- [✓] Eliminar métodos
- [✓] Añadir número de cuenta/nequi
- [✓] Visibilidad para cliente
- [✓] Envío automático de datos al cliente por WhatsApp

### 📋 5. CARRITO DE COMPRAS (CLIENTE)
- [✓] Agregar productos al carrito
- [✓] Aumentar/disminuir cantidad
- [✓] Eliminar del carrito
- [✓] Cálculo automático de totales
- [✓] Mostramiento de cantidad de artículos

### 💳 6. INFORMACIÓN DEL CLIENTE (CHECKOUT)
- [✓] Nombre del cliente
- [✓] Número de WhatsApp
- [✓] Opción: Domicilio Sí/No
- [✓] Si domicilio: Campo de dirección
- [✓] Si domicilio: Botón de ubicación en tiempo real
- [✓] Campo de notas (Sin salsa, con tomate, etc.)
- [✓] Selección de método de pago
- [✓] Verificación de horario de servicio
- [✓] Resumen del pedido antes de confirmar

### 🚚 7. SISTEMA DE DELIVERY
- [✓] Asignar delivery a un pedido
- [✓] Envío de datos al delivery por WhatsApp
- [✓] Link para que delivery confirme entrega
- [✓] Notificaciones al cliente cuando se asigna delivery

### 🪑 8. SISTEMA DE MESAS
- [✓] Crear mesas con núsmeros
- [✓] Establecer capacidad de mesa
- [✓] Editar mesas
- [✓] Eliminar mesas
- [✓] Duplicar mesas
- [✓] Estado: Ocupada/Disponible
- [✓] Bloqueo automático al crear pedido
- [✓] Desbloqueo manual
- [✓] Los pedidos de mesa NO van a estado "Enviado"

### 👨‍🍳 9. COCINA (COMANDAS)
- [✓] Vista de todos los pedidos en preparación
- [✓] Mostrar información completa del pedido
- [✓] Número único del pedido
- [✓] Nombre del cliente
- [✓] Número de mesa (si aplica)
- [✓] Items del pedido con cantidades
- [✓] Notas especiales del cliente
- [✓] Domicilio Sí/No

### 📱 10. NOTIFICACIONES
- [✓] Notificaciones en tiempo real para nuevos pedidos
- [✓] Sonido de notificación
- [✓] Badge con contador de notificaciones
- [✓] Registro de sesión login
- [✓] Actualización de estado por WhatsApp al cliente

### 🎎 11. PERSONALIZACIÓN
- [✓] Cambiar colores del sistema (Tema neón)
- [✓] Logo personalizado
- [✓] Nombre del negocio personalizado
- [✓] Información del negocio completa

---

## 🚪 ENDPOINTS DE LA API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/user` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Negocio
- `GET /api/business/info` - Obtener información
- `PUT /api/business/info` - Actualizar información
- `POST /api/business/change-password` - Cambiar contraseña

### Productos
- `GET /api/products/categories` - Listar categorías
- `POST /api/products/categories` - Crear categoría
- `PUT /api/products/categories/:id` - Actualizar categoría
- `DELETE /api/products/categories/:id` - Eliminar categoría
- `GET /api/products/products` - Listar productos
- `POST /api/products/products` - Crear producto
- `PUT /api/products/products/:id` - Actualizar producto
- `DELETE /api/products/products/:id` - Eliminar producto
- `POST /api/products/products/:id/duplicate` - Duplicar producto

### Pedidos
- `POST /api/orders/create` - Crear pedido (cliente)
- `GET /api/orders/list` - Listar pedidos
- `PUT /api/orders/update-status/:id` - Actualizar estado
- `PUT /api/orders/assign-delivery/:id` - Asignar delivery
- `GET /api/orders/stats` - Obtener estadísticas

### Métodos de Pago
- `GET /api/payments/` - Listar métodos (público)
- `GET /api/payments/admin/all` - Listar todos
- `POST /api/payments/` - Crear método
- `PUT /api/payments/:id` - Actualizar método
- `DELETE /api/payments/:id` - Eliminar método

### Mesas
- `GET /api/tables/` - Listar mesas
- `POST /api/tables/` - Crear mesa
- `PUT /api/tables/:id` - Actualizar mesa
- `DELETE /api/tables/:id` - Eliminar mesa
- `POST /api/tables/:id/duplicate` - Duplicar mesa

---

## 🔁 Ciclo de Vida del Pedido

```
Cliente crea pedido en carrito
         ↓
   PENDIENTE (notificación al dueno)
         ↓
   PREPARACIÓn (en cocina/mostrador)
         ↓
  Domicilio?
   / \
  Sí   No
  |     |
  |   ENTREGADO (mostraador)
  |   (cliente recoge)
  |
ENVIADO
(delivery/domiciliario)
  |
ENTREGADO
(cliente recibe)
  |
(Se registra ingreso)
```

---

## 📄 Notas Importantes

### Base de Datos
- SQLite se crea automáticamente en `tilio.db`
- Todos los datos se guardan localmente
- No requiere configuración externa

### Seguridad
- Contraseñas hasheadas con bcrypt
- Tokens JWT para autenticación
- Validación en frontend y backend

### WhatsApp
- Actualmente simulado (logs en consola)
- Para activar: Configurar credenciales de Twilio en `.env`
- El sistema envía notificaciones automáticas

### Geolocalización
- Requiere permiso del navegador
- Obtiene lat/lng en tiempo real
- Se envía al servidor

---

## 🚀 Próximas Mejoras

- [ ] Integración real con Twilio WhatsApp
- [ ] Dashboard de analytics avanzado
- [ ] Reportes de ventas por período
- [ ] Sistema de cupones/descuentos
- [ ] App móvil nativa
- [ ] Integración con pasarelas de pago (Stripe, PayU)
- [ ] Sistema de calificaciones

---

## 👋 Soporte

Para reportar bugs o sugerencias:
1. Crea un issue en GitHub
2. Describe el problema claramente
3. Incluye capturas si es posible

---

## 📁 Licencia

MIT License - Libre para usar comercialmente

---

**🌟 ¡Gracias por usar TILIO! ¡A vender! 🚀**
