const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../database');

router.get('/', verifyToken, async (req, res) => {
  try {
    const payments = await db.all(
      `SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC`,
      [req.userId]
    );
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, accountNumber, visible } = req.body;
    
    const result = await db.run(
      `INSERT INTO payments (userId, name, accountNumber, visible) VALUES (?, ?, ?, ?)`,
      [req.userId, name, accountNumber, visible !== false ? 1 : 0]
    );

    res.json({ id: result.lastID, message: 'Método de pago creado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, accountNumber, visible } = req.body;
    
    await db.run(
      `UPDATE payments SET name = ?, accountNumber = ?, visible = ? WHERE id = ? AND userId = ?`,
      [name, accountNumber, visible, req.params.id, req.userId]
    );

    res.json({ message: 'Método de pago actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.run(
      `DELETE FROM payments WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );
    res.json({ message: 'Método de pago eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;