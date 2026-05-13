const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get, all } = require('../database');
const router = express.Router();

const SECRET_KEY = 'tilio-secret-key-2026';

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, businessName } = req.body;

    if (!email || !password || !businessName) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await run(
      `INSERT INTO users (email, password, businessName) VALUES (?, ?, ?)`,
      [email, hashedPassword, businessName]
    );

    const token = jwt.sign({ id: result.lastID, email }, SECRET_KEY, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: { id: result.lastID, email, businessName }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await get(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Registrar sesión
    await run(
      `INSERT INTO sessions (userId, ipAddress) VALUES (?, ?)`,
      [user.id, req.ip]
    );

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        businessName: user.businessName,
        businessLogo: user.businessLogo,
        businessColors: user.businessColors
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener usuario actual
router.get('/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No autorizado' });

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await get(`SELECT * FROM users WHERE id = ?`, [decoded.id]);

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No autorizado' });

    const decoded = jwt.verify(token, SECRET_KEY);
    
    await run(
      `UPDATE sessions SET logoutTime = CURRENT_TIMESTAMP WHERE userId = ? ORDER BY id DESC LIMIT 1`,
      [decoded.id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
