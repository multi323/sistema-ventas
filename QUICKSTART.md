# 🚀 TILIO - Sistema de Ventas

## ⚡ INICIO RÁPIDO

### Windows
```bash
double-click start.bat
```

### Mac/Linux
```bash
chmod +x start.sh
./start.sh
```

### Manual
```bash
npm install
npm start
```

Luego abre: **http://localhost:3000**

---

## 📋 Requisitos

- **Node.js** 14+ (descarga desde nodejs.org)
- **NPM** (incluido con Node.js)
- **Navegador moderno** (Chrome, Firefox, Edge)

---

## 🎯 Primeros Pasos

### 1. Registro
1. Abre http://localhost:3000
2. Haz clic en **"Registrarse"**
3. Completa:
   - Email
   - Contraseña
   - Nombre del negocio
4. Haz clic en **"REGISTRARSE"**

### 2. Configuración
1. Ve a **Gestión Menú > Información**
2. Completa:
   - Logo (sube imagen)
   - Teléfono
   - Dirección
   - Horario
3. **Guardar Cambios**

### 3. Productos
1. **Gestión Menú > Categorías**
   - Agrega categorías (Hamburguesas, Pizzas, etc.)
2. **Gestión Menú > Productos**
   - Agrega productos con precios e imágenes

### 4. Compartir Carta
1. **Gestión Menú > Mi Carta**
2. Personaliza colores
3. Haz clic en **"Copiar Enlace"**
4. Comparte con clientes por WhatsApp

---

## 📊 Características Principales

✅ **Login profesional** con diseño neón  
✅ **Dashboard ejecutivo** con estadísticas  
✅ **Tablero de pedidos** tipo Kanban  
✅ **Gestión completa de menú**  
✅ **Carrito de compras** para clientes  
✅ **Sistema de mesas** para restaurantes  
✅ **Notificaciones** en tiempo real  
✅ **Integración WhatsApp** (simulada)  
✅ **Base de datos local** sin configuración  
✅ **100% personalizable**  

---

## 🗂️ Estructura Rápida

```
sistema-ventas/
├── server.js           ← Servidor principal
├── database.js         ← Base de datos
├── routes/             ← APIs
├── public/
│   ├── index.html      ← Login
│   ├── dashboard.html  ← Panel admin
│   ├── client-menu.html← Carta clientes
│   ├── css/            ← Estilos
│   └── js/             ← Scripts
├── package.json
├── start.sh / start.bat
└── README.md
```

---

## 🔧 Solución de Problemas

### No inicia el servidor
```bash
# Instala dependencias de nuevo
rm -rf node_modules
npm install
npm start
```

### Puerto 3000 ya está en uso
```bash
# Usa otro puerto
PORT=3001 npm start
```

### Base de datos corrupta
```bash
# Elimina y se recreará
rm tilio.db
npm start
```

---

## 📚 Documentación Completa

- **INSTALACION.md** - Guía detallada de instalación
- **GUIA_USO.md** - Cómo usar el sistema paso a paso

---

## 🚀 Pronto en Producción

Para subir a producción:

```bash
# 1. Configura variables .env
cp .env.example .env
# Edita .env con tus valores

# 2. Instala dependencias
npm install --production

# 3. Inicia en modo producción
NODE_ENV=production npm start
```

Recomendado usar **PM2** o **Heroku** para producción.

---

## 💬 Soporte

¿Preguntas? Crea un issue en GitHub.  
¿Quieres mejorar? Abre un Pull Request.

---

## 📄 Licencia

MIT - Libre para usar comercialmente

---

**🎉 ¡Ya estás listo para vender! 🚀**
