# GUIA DE USO - TILIO

## 🔐 1. LOGIN

### Primer acceso
1. Abre `http://localhost:3000`
2. Haz clic en **"Registrarse"**
3. Completa:
   - Email (ej: tuemail@negocio.com)
   - Contraseña (mínimo 6 caracteres)
   - Nombre del Negocio
4. Marca opciones si deseas recordar datos
5. Haz clic en **"REGISTRARSE"**

### Accesos posteriores
1. La contraseña se cargará automáticamente
2. Solo haz clic en **"ACCEDER"**

---

## 📊 2. DASHBOARD

Al entrar vers:

### Estadísticas
- **Pedidos Hoy**: Cantidad de pedidos del día actual
- **Ingresos Hoy**: Total vendido (sólo pedidos entregados)
- **Total Pedidos**: Todos los pedidos de tu negocio

### Pedidos Recientes
- Últimos 5 pedidos
- Haz clic para ver detalles

---

## 📋 3. TABLERO DE PEDIDOS (KANBAN)

Haz clic en **"Tablero Pedidos"** en el menú

### Estados del Pedido
1. **Pendiente** 🟣 - Acaba de llegar
2. **Preparación** 🍳 - En preparación
3. **Enviado** 🚚 - En camino (sólo delivery)
4. **Entregado** ✅ - Completado
5. **Cancelado** ❌ - Rechazado

### Cómo usar
- Haz clic en tarjeta para ver detalles
- Usa filtros para ver un estado específíco
- Actualiza estado manual o automáticamente

---

## 🍽️ 4. GESTION DE MENÚ

### 4.1 Información General
1. Haz clic en **"Gestión Menú"**
2. Abre pestaña **"ℹ️ Información"**
3. Completa:
   - Logo (sube imagen)
   - Nombre del negocio
   - Teléfono
   - Dirección
   - Hora apertura/cierre
   - Moneda
4. Haz clic en **"Guardar Cambios"**

### 4.2 Mi Carta Virtual
1. Abre pestaña **"📖 Mi Carta"**
2. Personaliza:
   - Color primario
   - Color secundario
   - Imagen de portada
3. Haz clic en **"Copiar Enlace"**
4. Comparte el enlace con tus clientes

### 4.3 Categorías
1. Abre pestaña **"📂 Categorías"**
2. Haz clic en **"➕ Agregar Categoría"**
3. Escribe nombre (ej: Hamburguesas)
4. Sube imagen
5. Marca si deseas que sea destacada
6. Haz clic en **Guardar**

### 4.4 Productos
1. Abre pestaña **"🍽️ Productos"**
2. Haz clic en **"➕ Agregar Producto"**
3. Completa:
   - Nombre
   - Descripción
   - Precio
   - Categoría
   - Imagen
4. Marca visibilidad/destacado
5. Haz clic en **Guardar**

### 4.5 Métodos de Pago
1. Abre pestaña **"💳 Métodos Pago"**
2. Haz clic en **"➕ Agregar Método"**
3. Selecciona:
   - Tipo (Nequi, Transferencia, Efectivo, etc.)
   - Número de cuenta/Nequi
4. Marca si es visible para cliente
5. Haz clic en **Guardar**

### 4.6 Mesas (Restaurantes)
1. Abre pestaña **"🪑 Mesas"**
2. Haz clic en **"➕ Agregar Mesa"**
3. Establece:
   - Número (ej: 1, 2, 3)
   - Capacidad (personas)
4. Haz clic en **Guardar**

---

## 🚚 5. COCINA (COMANDAS)

1. Haz clic en **"Cocina"** en el menú
2. Versás todos los pedidos en preparación
3. Cada comanda muestra:
   - Número de pedido
   - Nombre del cliente
   - Número de mesa (si aplica)
   - Items con cantidades
   - Notas especiales

---

## 📋 6. DESDE EL CLIENTE (CARTA VIRTUAL)

### El cliente abre el enlace y ve:

1. **Menú de Categorías**
   - Filtra por categoría
   - Ve productos disponibles

2. **Productos**
   - Imagen
   - Descripción
   - Precio
   - Botones +/- para cantidad
   - Botón "Añadir al carrito"

3. **Carrito** (lado derecho)
   - Lista de productos seleccionados
   - Cantidad y precio unitario
   - Botón "Realizar Pedido"

4. **Checkout**
   - Nombre
   - Número WhatsApp
   - ¿Domicilio Sí/No?
   - Si sí: Dirección y ubicación
   - Notas (sin salsa, etc.)
   - Método de pago
   - Resumen total
   - Botón confirmar

5. **Confirmación**
   - Recibe número de pedido
   - Se le envía WhatsApp automático
   - Se agrega a tu dashboard

---

## 📱 7. NOTIFICACIONES

### Como dueño:
1. Haz clic en la campana (🔔) en la esquina superior
2. Verás:
   - Nuevos pedidos
   - Actualizaciones de estado
   - Eventos del sistema

### Como cliente:
- Recibe mensajes por WhatsApp cuando:
  - Se confirma el pedido
  - Entra a preparación
  - Está en camino (delivery)
  - Ha sido entregado

---

## 🚪 8. CERRAR SESIÓN

1. Haz clic en botón **"🚪 Cerrar Sesión"** en el menú lateral
2. Se te redirigirá al login
3. Tus datos se guardaron automáticamente

---

## 🔑 9. CAMBIAR CONTRASEñA

1. En Menú > Gestión Menú > Información
2. Haz clic en **"🔑 Cambiar Contraseña"**
3. Ingresa:
   - Contraseña actual
   - Nueva contraseña
   - Confirmar nueva
4. Haz clic en **"Cambiar"**

---

## 🔄 TROUBLESHOOTING

### No se carga el dashboard
- Verifica que el servidor esté corriendo
- Abre la consola (F12) y revisa errores
- Intenta recargar (Ctrl+R)

### El carrito no se actualiza
- Recarga la página
- Borra el caché del navegador

### No llegan notificaciones por WhatsApp
- La integración está simulada
- Para activar: Configura Twilio en `.env`

### Error al subir imagen
- Verifica que sea JPG, PNG
- Máximo 5MB
- Intenta de nuevo

---

## 🌟 Tips de Uso

✅ **Actualiza tu información regularmente**
✅ **Mantén horarios precisos**
✅ **Personaliza colores según tu marca**
✅ **Añade descripciones a productos**
✅ **Comparte el enlace de carta con clientes**
✅ **Revisa notificaciones frecuentemente**
✅ **Actualiza estado de pedidos rápidamente**

---

**🌟 ¡Listo para vender! 🚀**
