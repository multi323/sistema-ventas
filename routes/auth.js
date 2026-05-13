const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'tilio-secret-key-2026';

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, businessName } = req.body;
    
    if (!email || !password || !businessName) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      `INSERT INTO users (email, password, businessName) VALUES (?, ?, ?)`,
      [email, hashedPassword, businessName]
    );

    const token = jwt.sign({ userId: result.lastID }, JWT_SECRET, { expiresIn: '30d' });
    
    res.json({ 
      message: 'Usuario registrado exitosamente',
      token,
      userId: result.lastID,
      businessName
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

    await db.run(
      `INSERT INTO sessions (userId, ipAddress) VALUES (?, ?)`,
      [user.id, req.ip]
    );

    const tokenExpiry = rememberMe ? '30d' : '7d';
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: tokenExpiry });
    
    res.json({ 
      token, 
      userId: user.id,
      businessName: user.businessName,
      businessLogo: user.businessLogo,
      businessColors: user.businessColors ? JSON.parse(user.businessColors) : {},
      rememberMe
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({
      id: user.id,
      email: user.email,
      businessName: user.businessName,
      businessPhone: user.businessPhone,
      businessAddress: user.businessAddress,
      businessLogo: user.businessLogo,
      businessColors: user.businessColors ? JSON.parse(user.businessColors) : {},
      openTime: user.openTime,
      closeTime: user.closeTime,
      currency: user.currency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { businessName, businessPhone, businessAddress, businessLogo, businessColors, openTime, closeTime, currency } = req.body;
    
    await db.run(
      `UPDATE users SET businessName = ?, businessPhone = ?, businessAddress = ?, businessLogo = ?, businessColors = ?, openTime = ?, closeTime = ?, currency = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [businessName, businessPhone, businessAddress, businessLogo, JSON.stringify(businessColors), openTime, closeTime, currency, req.userId]
    );

    res.json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = await db.get('SELECT password FROM users WHERE id = ?', [req.userId]);
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    
    if (!validPassword) return res.status(400).json({ error: 'Contraseña actual incorrecta' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.userId]);

    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', verifyToken, async (req, res) => {
  try {
    await db.run(
      `UPDATE sessions SET logoutTime = CURRENT_TIMESTAMP WHERE userId = ? AND logoutTime IS NULL`,
      [req.userId]
    );
    res.json({ message: 'Sesión cerrada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router, verifyToken };