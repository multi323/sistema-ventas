const express = require('express');
const { run, get, all } = require('../database');
const router = express.Router();
const jwt = require('jsonwebtoken');

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

// Obtener métodos de pago
router.get('/', verifyToken, async (req, res) => {
  try {
    const payments = await all(
      `SELECT * FROM payments WHERE userId = ? AND visible = 1`,
      [req.userId]
    );
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todos (admin)
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    const payments = await all(
      `SELECT * FROM payments WHERE userId = ? ORDER BY name ASC`,
      [req.userId]
    );
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar método de pago
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, accountNumber, visible } = req.body;

    const result = await run(
      `INSERT INTO payments (userId, name, accountNumber, visible) VALUES (?, ?, ?, ?)`,
      [req.userId, name, accountNumber, visible ?? 1]
    );

    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar método de pago
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, accountNumber, visible } = req.body;

    await run(
      `UPDATE payments SET name = ?, accountNumber = ?, visible = ? WHERE id = ? AND userId = ?`,
      [name, accountNumber, visible, req.params.id, req.userId]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar método de pago
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await run(
      `DELETE FROM payments WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
