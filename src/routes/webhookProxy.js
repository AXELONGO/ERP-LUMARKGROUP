const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const asyncHandler = require('../middleware/asyncHandler');
const env = require('../config/env');

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Max 30 webhooks por IP cada 15 min
  message: { error: 'Demasiados webhooks enviados, por favor espera.' }
});

router.post('/', webhookLimiter, asyncHandler(async (req, res) => {
  const { module, payload } = req.body;
  if (!module) return res.status(400).json({ error: 'Falta el módulo para el webhook' });

  const envVar = `N8N_${module.toUpperCase()}_WEBHOOK_URL`;
  const url = env[envVar];

  if (!url) {
    return res.status(403).json({ error: 'Endpoint de webhook no configurado o no permitido' });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  res.json({ success: response.ok, status: response.status, data });
}));

module.exports = router;
