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

// CATEGORÍAS

// Obtener categorías
router.get('/categories', verifyToken, async (req, res) => {
  try {
    const categories = await all(
      `SELECT * FROM categories WHERE userId = ? ORDER BY name ASC`,
      [req.userId]
    );
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar categoría
router.post('/categories', verifyToken, async (req, res) => {
  try {
    const { name, image, visible, featured } = req.body;
    
    const result = await run(
      `INSERT INTO categories (userId, name, image, visible, featured) VALUES (?, ?, ?, ?, ?)`,
      [req.userId, name, image, visible ?? 1, featured ?? 0]
    );

    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar categoría
router.put('/categories/:id', verifyToken, async (req, res) => {
  try {
    const { name, image, visible, featured } = req.body;
    
    await run(
      `UPDATE categories SET name = ?, image = ?, visible = ?, featured = ? WHERE id = ? AND userId = ?`,
      [name, image, visible, featured, req.params.id, req.userId]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar categoría
router.delete('/categories/:id', verifyToken, async (req, res) => {
  try {
    await run(
      `DELETE FROM categories WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PRODUCTOS

// Obtener productos
router.get('/products', verifyToken, async (req, res) => {
  try {
    const products = await all(
      `SELECT p.*, c.name as categoryName FROM products p 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE p.userId = ? ORDER BY p.createdAt DESC`,
      [req.userId]
    );
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agregar producto
router.post('/products', verifyToken, async (req, res) => {
  try {
    const { categoryId, name, description, price, image, visible, featured } = req.body;
    
    const result = await run(
      `INSERT INTO products (userId, categoryId, name, description, price, image, visible, featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, categoryId, name, description, price, image, visible ?? 1, featured ?? 0]
    );

    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar producto
router.put('/products/:id', verifyToken, async (req, res) => {
  try {
    const { categoryId, name, description, price, image, visible, featured } = req.body;
    
    await run(
      `UPDATE products SET categoryId = ?, name = ?, description = ?, price = ?, image = ?, visible = ?, featured = ? 
       WHERE id = ? AND userId = ?`,
      [categoryId, name, description, price, image, visible, featured, req.params.id, req.userId]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Duplicar producto
router.post('/products/:id/duplicate', verifyToken, async (req, res) => {
  try {
    const product = await get(
      `SELECT * FROM products WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );

    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const result = await run(
      `INSERT INTO products (userId, categoryId, name, description, price, image, visible, featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [product.userId, product.categoryId, product.name + ' (Copia)', product.description, product.price, product.image, product.visible, product.featured]
    );

    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar producto
router.delete('/products/:id', verifyToken, async (req, res) => {
  try {
    await run(
      `DELETE FROM products WHERE id = ? AND userId = ?`,
      [req.params.id, req.userId]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
