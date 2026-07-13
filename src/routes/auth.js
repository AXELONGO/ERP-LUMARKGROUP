const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { loginWithGoogle, loginWithCredentials } = require('../services/authService');

router.post('/google', asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token no proporcionado' });
  }

  const result = await loginWithGoogle(token);
  
  res.json({
    success: true,
    token: result.token,
    user: result.user
  });
}));

router.post('/email', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });
  }

  const result = await loginWithCredentials(email, password);
  
  res.json({
    success: true,
    token: result.token,
    user: result.user
  });
}));

module.exports = router;
