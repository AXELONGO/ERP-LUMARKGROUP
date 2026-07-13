const NodeCache = require('node-cache');

// TTL de 30 segundos para evitar saturar la API de Google Sheets
const cache = new NodeCache({ stdTTL: 30, checkperiod: 40 });

module.exports = cache;
