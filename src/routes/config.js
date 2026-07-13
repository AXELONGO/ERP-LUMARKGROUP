const express = require('express');
const router = express.Router();
const env = require('../config/env');

router.get('/', (req, res) => {
  res.json({
    appName: env.APP_NAME || 'ERP',
    appLogo: env.APP_LOGO || '',
    googleClientId: env.GOOGLE_CLIENT_ID || ''
  });
});

module.exports = router;
