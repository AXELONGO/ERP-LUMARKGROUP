const cache = require('./cacheService');
const env = require('../config/env');const { getSheets } = require('../config/sheets');

async function getPublicData(sheetName) {
  const cacheKey = `sheet_${sheetName}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.SPREADSHEET_ID,
      range: `'${sheetName}'`, // Get all data in the sheet
    });

    const values = response.data.values || [];
    if (values.length === 0) {
      return [];
    }

    const headers = values[0];
    const rows = values.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => {
        let val = r[i] !== undefined ? r[i] : '';
        obj[h] = String(val);
      });
      return obj;
    });

    cache.set(cacheKey, rows);
    return rows;
  } catch (error) {
    const { reportBug } = require('./notificationService');
    reportBug(`Error leyendo la hoja "${sheetName}" desde Google Sheets`, { error: error.message, stack: error.stack });
    console.error(`Error fetching sheet ${sheetName}:`, error);
    return []; // Return empty array to avoid crashing the dashboard
  }
}

function toRows(values) {
  if (!values || values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map((row, i) => {
    const obj = { _rowIndex: i + 2 }; // 1-indexed, +1 for header, +1 for 1-based
    headers.forEach((h, j) => { obj[h] = row[j] || ''; });
    return obj;
  });
}

// Find actual row number in sheet by column A value (ID)
async function findRowById(sheets, sheetName, id) {
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: env.SPREADSHEET_ID,
    range: `'${sheetName}'!A:A`,
  });
  const vals = r.data.values || [];
  for (let i = 0; i < vals.length; i++) {
    if (vals[i][0] === id) return i + 1; // 1-indexed
  }
  return -1;
}

// Get sheetId by title
async function getSheetId(sheets, title) {
  const r = await sheets.spreadsheets.get({ spreadsheetId: env.SPREADSHEET_ID });
  const sheet = r.data.sheets.find(s => s.properties.title === title);
  return sheet ? sheet.properties.sheetId : null;
}

module.exports = {
  getPublicData,
  toRows,
  findRowById,
  getSheetId
};
