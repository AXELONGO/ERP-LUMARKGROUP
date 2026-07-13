const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

async function getSheets() {
  let authOptions = {
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  };
  
  if (process.env.GOOGLE_CREDENTIALS) {
    try {
      let rawCreds = process.env.GOOGLE_CREDENTIALS.trim();
      let isBase64 = false;
      
      if (!rawCreds.startsWith('{') && !rawCreds.startsWith('"') && !rawCreds.startsWith('\\{')) {
        try {
          rawCreds = Buffer.from(rawCreds, 'base64').toString('utf-8');
          isBase64 = true;
        } catch (err) {}
      }

      if (!isBase64) {
        if (rawCreds.startsWith('"') && rawCreds.endsWith('"')) {
          rawCreds = rawCreds.slice(1, -1);
        }
        rawCreds = rawCreds.replace(/\\"/g, '"').replace(/\\\\n/g, '\\n').replace(/\\{/g, '{').replace(/\\}/g, '}');
      }

      authOptions.credentials = typeof rawCreds === 'string' ? JSON.parse(rawCreds) : rawCreds;
    } catch (e) {
      const msg = `[AUTH] Error crítico parseando la variable GOOGLE_CREDENTIALS: ${e.message}`;
      const { reportBug } = require('../services/notificationService');
      reportBug(msg, { error: e.stack });
      throw new Error(msg);
    }
  } else {
    // Check in root directory
    const rootPath = path.join(__dirname, '../../');
    if (!fs.existsSync(path.join(rootPath, 'credentials.json'))) {
      throw new Error('[AUTH] credentials.json NO ENCONTRADO y GOOGLE_CREDENTIALS no configurado en el servidor.');
    }
    authOptions.keyFile = path.join(rootPath, 'credentials.json');
  }

  const auth = new google.auth.GoogleAuth(authOptions);
  return google.sheets({ version: 'v4', auth: await auth.getClient() });
}

module.exports = {
  getSheets
};
