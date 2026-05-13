const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../database');
const { generateOrderNumber, sendWhatsAppMessage } = require('../utils/helpers');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, startDate, endDate, limit } = req.query;
    let query = `SELECT * FROM orders WHERE userId = ?`;
    let params = [req.userId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (startDate && endDate) {
      query += ` AND createdAt BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    query += ` ORDER BY createdAt DESC`;
    if (limit) query += ` LIMIT ${parseInt(limit)}`;

    const orders = await db.all(query, params);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await db.get(
      `SELECT * FROM orders WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    
    order.items = JSON.parse(order.items);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { clientName, clientPhone, clientEmail, items, totalAmount, deliveryNeeded, deliveryAddress, deliveryLat, deliveryLng, notes, tableId, paymentMethod } = req.body;
    
    const orderNumber = generateOrderNumber();

    const result = await db.run(
      `INSERT INTO orders (userId, orderNumber, clientName, clientPhone, clientEmail, items, totalAmount, status, deliveryNeeded, deliveryAddress, deliveryLat, deliveryLng, notes, tableId, paymentMethod)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, orderNumber, clientName, clientPhone, clientEmail, JSON.stringify(items), totalAmount, deliveryNeeded, deliveryAddress, deliveryLat, deliveryLng, notes, tableId, paymentMethod]
    );

    await db.run(
      `INSERT INTO notifications (userId, orderId, message) VALUES (?, ?, ?)`,
      [req.userId, result.lastID, `Nuevo pedido #${orderNumber} de ${clientName}`]
    );

    if (tableId) {
      await db.run(`UPDATE tables SET occupied = 1 WHERE id = ?`, [tableId]);
    }

    await sendWhatsAppMessage(clientPhone, `¡Hola ${clientName}!\n\nTu pedido #${orderNumber} ha sido recibido.\nEstado: Pendiente\nMonto: $${totalAmount}`);

    res.json({ id: result.lastID, orderNumber, message: 'Pedido creado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, deliveryPersonName, deliveryPersonPhone } = req.body;
    
    const order = await db.get(`SELECT * FROM orders WHERE id = ? AND userId = ?`, [req.params.id, req.userId]);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

    await db.run(
      `UPDATE orders SET status = ?, deliveryPersonName = ?, deliveryPersonPhone = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, deliveryPersonName, deliveryPersonPhone, req.params.id]
    );

    const statusMessages = {
      'preparacion': 'Tu pedido está en preparación',
      'enviado': 'Tu pedido ha sido enviado',
      'entregado': 'Tu pedido ha sido entregado',
      'cancelado': 'Tu pedido ha sido cancelado'
    };

    await db.run(
      `INSERT INTO notifications (userId, orderId, message) VALUES (?, ?, ?)`,
      [req.userId, req.params.id, `Pedido #${order.orderNumber} - ${statusMessages[status] || status}`]
    );

    if (statusMessages[status]) {
      await sendWhatsAppMessage(order.clientPhone, `📦 ${statusMessages[status]}\nPedido: #${order.orderNumber}`);
    }

    res.json({ message: 'Estado actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const order = await db.get(`SELECT * FROM orders WHERE id = ? AND userId = ?`, [req.params.id, req.userId]);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

    await db.run(`UPDATE orders SET status = 'cancelado' WHERE id = ?`, [req.params.id]);

    if (order.tableId) {
      await db.run(`UPDATE tables SET occupied = 0 WHERE id = ?`, [order.tableId]);
    }

    await sendWhatsAppMessage(order.clientPhone, `❌ Tu pedido #${order.orderNumber} ha sido cancelado.`);

    res.json({ message: 'Pedido cancelado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;