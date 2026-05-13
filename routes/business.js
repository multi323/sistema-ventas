const express = require('express');
const { run, get } = require('../database');
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

// Obtener información del negocio
router.get('/info', verifyToken, async (req, res) => {
  try {
    const business = await get(`SELECT * FROM users WHERE id = ?`, [req.userId]);
    res.json({ success: true, business });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar información
router.put('/info', verifyToken, async (req, res) => {
  try {
    const {
      businessName,
      businessPhone,
      businessAddress,
      businessLogo,
      openTime,
      closeTime,
      currency,
      businessColors
    } = req.body;

    const sql = `
      UPDATE users SET 
        businessName = ?, 
        businessPhone = ?, 
        businessAddress = ?, 
        businessLogo = ?, 
        openTime = ?, 
        closeTime = ?, 
        currency = ?,
        businessColors = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await run(sql, [
      businessName,
      businessPhone,
      businessAddress,
      businessLogo,
      openTime,
      closeTime,
      currency,
      JSON.stringify(businessColors),
      req.userId
    ]);

    res.json({ success: true, message: 'Negocio actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar contraseña
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');

    const user = await get(`SELECT password FROM users WHERE id = ?`, [req.userId]);
    const validPassword = await bcrypt.compare(oldPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, req.userId]);

    res.json({ success: true, message: 'Contraseña actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
