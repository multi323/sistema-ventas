const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const db = require('../database');

router.get('/categories', verifyToken, async (req, res) => {
  try {
    const categories = await db.all(
      `SELECT * FROM categories WHERE userId = ? ORDER BY createdAt DESC`,
      [req.userId]
    );
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/categories', verifyToken, async (req, res) => {
  try {
    const { name, image, visible, featured } = req.body;
    
    const result = await db.run(
      `INSERT INTO categories (userId, name, image, visible, featured) VALUES (?, ?, ?, ?, ?)`,
      [req.userId, name, image, visible || 1, featured || 0]
    );

    res.json({ id: result.lastID, message: 'Categoría creada' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/categories/:id', verifyToken, async (req, res) => {
  try {
    const { name, image, visible, featured } = req.body;
    
    await db.run(
      `UPDATE categories SET name = ?, image = ?, visible = ?, featured = ? WHERE id = ? AND userId = ?`,
      [name, image, visible, featured, req.params.id, req.userId]
    );

    res.json({ message: 'Categoría actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/categories/:id', verifyToken, async (req, res) => {
  try {
    await db.run(
      `DELETE FROM categories WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const { categoryId } = req.query;
    let query = `SELECT * FROM products WHERE userId = ?`;
    let params = [req.userId];

    if (categoryId) {
      query += ` AND categoryId = ?`;
      params.push(categoryId);
    }

    query += ` ORDER BY createdAt DESC`;
    const products = await db.all(query, params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const product = await db.get(
      `SELECT * FROM products WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { categoryId, name, description, price, image, visible, featured } = req.body;
    
    const result = await db.run(
      `INSERT INTO products (userId, categoryId, name, description, price, image, visible, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, categoryId, name, description, price, image, visible || 1, featured || 0]
    );

    res.json({ id: result.lastID, message: 'Producto creado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, description, price, image, visible, featured, categoryId } = req.body;
    
    await db.run(
      `UPDATE products SET name = ?, description = ?, price = ?, image = ?, visible = ?, featured = ?, categoryId = ? WHERE id = ? AND userId = ?`,
      [name, description, price, image, visible, featured, categoryId, req.params.id, req.userId]
    );

    res.json({ message: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.run(
      `DELETE FROM products WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/duplicate', verifyToken, async (req, res) => {
  try {
    const product = await db.get(
      `SELECT * FROM products WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );
    
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const result = await db.run(
      `INSERT INTO products (userId, categoryId, name, description, price, image, visible, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [product.userId, product.categoryId, product.name + ' (copia)', product.description, product.price, product.image, product.visible, product.featured]
    );

    res.json({ id: result.lastID, message: 'Producto duplicado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;