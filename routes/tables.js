const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../database');

router.get('/', verifyToken, async (req, res) => {
  try {
    const tables = await db.all(
      `SELECT * FROM tables WHERE userId = ? ORDER BY tableNumber ASC`,
      [req.userId]
    );
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;
    
    const result = await db.run(
      `INSERT INTO tables (userId, tableNumber, capacity) VALUES (?, ?, ?)`,
      [req.userId, tableNumber, capacity]
    );

    res.json({ id: result.lastID, message: 'Mesa creada' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { tableNumber, capacity, occupied } = req.body;
    
    await db.run(
      `UPDATE tables SET tableNumber = ?, capacity = ?, occupied = ? WHERE id = ? AND userId = ?`,
      [tableNumber, capacity, occupied, req.params.id, req.userId]
    );

    res.json({ message: 'Mesa actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.run(
      `DELETE FROM tables WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );
    res.json({ message: 'Mesa eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/duplicate', verifyToken, async (req, res) => {
  try {
    const table = await db.get(
      `SELECT * FROM tables WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );
    
    if (!table) return res.status(404).json({ error: 'Mesa no encontrada' });

    const result = await db.run(
      `INSERT INTO tables (userId, tableNumber, capacity) VALUES (?, ?, ?)`,
      [req.userId, table.tableNumber + 100, table.capacity]
    );

    res.json({ id: result.lastID, message: 'Mesa duplicada' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;