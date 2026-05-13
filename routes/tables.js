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

// Obtener mesas
router.get('/', verifyToken, async (req, res) => {
  try {
    const tables = await all(
      `SELECT * FROM tables WHERE userId = ? ORDER BY tableNumber ASC`,
      [req.userId]
    );
    res.json({ success: true, tables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar mesa
router.post('/', verifyToken, async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    const result = await run(
      `INSERT INTO tables (userId, tableNumber, capacity) VALUES (?, ?, ?)`,
      [req.userId, tableNumber, capacity || 4]
    );

    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar mesa
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { tableNumber, capacity, occupied } = req.body;

    await run(
      `UPDATE tables SET tableNumber = ?, capacity = ?, occupied = ? WHERE id = ? AND userId = ?`,
      [tableNumber, capacity, occupied, req.params.id, req.userId]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Duplicar mesa
router.post('/:id/duplicate', verifyToken, async (req, res) => {
  try {
    const table = await get(
      `SELECT * FROM tables WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );

    if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });

    const newTableNumber = table.tableNumber + 1000;
    const result = await run(
      `INSERT INTO tables (userId, tableNumber, capacity) VALUES (?, ?, ?)`,
      [req.userId, newTableNumber, table.capacity]
    );

    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar mesa
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await run(
      `DELETE FROM tables WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
