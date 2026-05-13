const express = require('express');
const { run, get, all } = require('../database');
const router = express.Router();
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

const SECRET_KEY = 'tilio-secret-key-2026';

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Generar número de pedido único
const generateOrderNumber = async (userId) => {
  const date = new Date();
  const prefix = date.getFullYear().toString().slice(-2) + 
                 String(date.getMonth() + 1).padStart(2, '0') +
                 String(date.getDate()).padStart(2, '0');
  
  const lastOrder = await get(
    `SELECT orderNumber FROM orders WHERE userId = ? ORDER BY id DESC LIMIT 1`,
    [userId]
  );
  
  const number = lastOrder ? parseInt(lastOrder.orderNumber.slice(8)) + 1 : 1;
  return prefix + String(number).padStart(6, '0');
};

// Crear pedido
router.post('/create', async (req, res) => {
  try {
    const {
      userId,
      clientName,
      clientPhone,
      items,
      totalAmount,
      deliveryNeeded,
      deliveryAddress,
      notes,
      paymentMethod,
      tableId
    } = req.body;

    // Verificar horario
    const business = await get(`SELECT openTime, closeTime FROM users WHERE id = ?`, [userId]);
    const now = new Date();
    const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    
    if (currentTime < business.openTime || currentTime > business.closeTime) {
      return res.status(400).json({ error: 'Fuera de horario de servicio' });
    }

    const orderNumber = await generateOrderNumber(userId);

    const result = await run(
      `INSERT INTO orders (
        userId, orderNumber, clientName, clientPhone, items, totalAmount, 
        deliveryNeeded, deliveryAddress, notes, paymentMethod, tableId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, orderNumber, clientName, clientPhone,
        JSON.stringify(items), totalAmount,
        deliveryNeeded, deliveryAddress, notes, paymentMethod, tableId || null
      ]
    );

    // Bloquear mesa si aplica
    if (tableId) {
      await run(`UPDATE tables SET occupied = 1 WHERE id = ?`, [tableId]);
    }

    // Enviar notificación WhatsApp al cliente
    await sendWhatsAppNotification(clientPhone, `
✅ *PEDIDO CONFIRMADO*

📋 *Pedido #${orderNumber}*
💰 *Total: $${totalAmount}*

Tu pedido ha sido recibido y está en preparación.
Te notificaremos cuando esté listo.
    `);

    // Crear notificación en el sistema
    await run(
      `INSERT INTO notifications (userId, orderId, message) VALUES (?, ?, ?)`,
      [userId, result.lastID, `Nuevo pedido #${orderNumber} de ${clientName}`]
    );

    res.json({ success: true, orderNumber, orderId: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener pedidos
router.get('/list', verifyToken, async (req, res) => {
  try {
    const { status, date } = req.query;
    let sql = `SELECT * FROM orders WHERE userId = ?`;
    let params = [req.userId];

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    if (date) {
      sql += ` AND DATE(createdAt) = ?`;
      params.push(date);
    }

    sql += ` ORDER BY createdAt DESC`;

    const orders = await all(sql, params);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar estado pedido
router.put('/update-status/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await get(`SELECT * FROM orders WHERE id = ? AND userId = ?`, [req.params.id, req.userId]);

    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

    let updateSql = `UPDATE orders SET status = ?`;
    let params = [status];

    if (status === 'entregado') {
      updateSql += `, completedAt = CURRENT_TIMESTAMP`;
    }

    updateSql += ` WHERE id = ?`;
    params.push(req.params.id);

    await run(updateSql, params);

    // Enviar notificación al cliente
    const statusMessages = {
      preparacion: '🍳 Tu pedido está en preparación',
      enviado: '🚚 Tu pedido está en camino',
      entregado: '✅ Tu pedido ha sido entregado',
      cancelado: '❌ Tu pedido ha sido cancelado'
    };

    if (statusMessages[status]) {
      await sendWhatsAppNotification(order.clientPhone, statusMessages[status]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Asignar delivery
router.put('/assign-delivery/:id', verifyToken, async (req, res) => {
  try {
    const { deliveryPersonName, deliveryPersonPhone } = req.body;
    const order = await get(`SELECT * FROM orders WHERE id = ? AND userId = ?`, [req.params.id, req.userId]);

    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

    await run(
      `UPDATE orders SET deliveryPersonName = ?, deliveryPersonPhone = ? WHERE id = ?`,
      [deliveryPersonName, deliveryPersonPhone, req.params.id]
    );

    // Notificar al delivery
    const deliveryLink = `${process.env.DELIVERY_LINK || 'http://localhost:3000'}/delivery/${req.params.id}`;
    await sendWhatsAppNotification(deliveryPersonPhone, `
🚚 *NUEVO PEDIDO PARA DELIVERY*

📋 *Pedido #${order.orderNumber}*
👤 *Cliente: ${order.clientName}*
📞 *Teléfono: ${order.clientPhone}*
📍 *Dirección: ${order.deliveryAddress}*
💰 *Total: $${order.totalAmount}*

Verifica el estado aquí: ${deliveryLink}
    `);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Estadísticas
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    let dateFilter = date ? `AND DATE(createdAt) = '${date}'` : `AND DATE(createdAt) = DATE('now')`;

    const todayOrders = await all(
      `SELECT COUNT(*) as count FROM orders WHERE userId = ? ${dateFilter}`,
      [req.userId]
    );

    const todayRevenue = await get(
      `SELECT SUM(totalAmount) as total FROM orders WHERE userId = ? AND status = 'entregado' ${dateFilter}`,
      [req.userId]
    );

    const totalOrders = await get(
      `SELECT COUNT(*) as count FROM orders WHERE userId = ?`,
      [req.userId]
    );

    res.json({
      success: true,
      stats: {
        ordersToday: todayOrders[0]?.count || 0,
        revenueToday: todayRevenue?.total || 0,
        totalOrders: totalOrders?.count || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Función para enviar WhatsApp (simulado - requiere Twilio configurado)
const sendWhatsAppNotification = async (phone, message) => {
  try {
    // TODO: Configurar credenciales de Twilio
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: 'whatsapp:+14155552671',
    //   to: `whatsapp:${phone}`
    // });
    console.log(`📱 WhatsApp enviado a ${phone}`);
  } catch (err) {
    console.error('Error enviando WhatsApp:', err);
  }
};

module.exports = router;
