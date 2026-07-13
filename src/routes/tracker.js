const express = require('express');
const router = express.Router();
const sheetsService = require('../services/sheetsService');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const data = await sheetsService.getPublicData('Tracker Semanal');
  res.json(data);
}));

module.exports = router;
