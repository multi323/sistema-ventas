const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../database');

router.get('/info', verifyToken, async (req, res) => {
  try {
    const business = await db.get('SELECT * FROM users WHERE id = ?', [req.userId]);
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/info', verifyToken, async (req, res) => {
  try {
    const { businessName, businessPhone, businessAddress, openTime, closeTime, currency, businessLogo, businessColors } = req.body;
    
    await db.run(
      `UPDATE users SET businessName = ?, businessPhone = ?, businessAddress = ?, openTime = ?, closeTime = ?, currency = ?, businessLogo = ?, businessColors = ? WHERE id = ?`,
      [businessName, businessPhone, businessAddress, openTime, closeTime, currency, businessLogo, JSON.stringify(businessColors), req.userId]
    );

    res.json({ message: 'Información actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        COUNT(*) as totalOrders,
        SUM(CASE WHEN status = 'entregado' THEN totalAmount ELSE 0 END) as totalRevenue,
        AVG(totalAmount) as averageOrder
      FROM orders
      WHERE userId = ?
    `;
    let params = [req.userId];

    if (startDate && endDate) {
      query += ` AND createdAt BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    const stats = await db.get(query, params);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const notifications = await db.all(
      `SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 20`,
      [req.userId]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/notifications/:id', verifyToken, async (req, res) => {
  try {
    await db.run(
      `UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );
    res.json({ message: 'Notificación actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sessions', verifyToken, async (req, res) => {
  try {
    const sessions = await db.all(
      `SELECT * FROM sessions WHERE userId = ? ORDER BY loginTime DESC`,
      [req.userId]
    );
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;