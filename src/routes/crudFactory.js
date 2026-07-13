const { getSheets } = require('../config/sheets');
const sheetsService = require('../services/sheetsService');
const env = require('../config/env');
const constants = require('../config/constants');
const asyncHandler = require('../middleware/asyncHandler');
const { sanitizeInput } = require('../middleware/sanitize');
const cache = require('../services/cacheService');

// Re-usamos esto porque sendWebhook del frontend se dispara manualmente? No,
// aquí el backend también dispara webhooks internamente si algo se crea, pero en este código legacy
// veo notificaciones. Vamos a usar notificationService.
const { notifyEvent } = require('../services/notificationService');

/**
 * Genera rutas CRUD completas para un módulo dado
 * @param {express.Router} router - El router de express
 * @param {string} sheetName - Nombre de la hoja en Google Sheets
 * @param {string} range - Rango a consultar (ej. 'A:Z')
 * @param {Function} mapper - Función que transforma el body en un arreglo de columnas para sheets
 * @param {string} endpoint - El path de la ruta (ej. 'clientes')
 */
function crudRoutes(router, sheetName, range, mapper, endpoint) {
  
  // GET
  router.get(`/${endpoint}`, asyncHandler(async (req, res) => {
    const rows = await sheetsService.getPublicData(sheetName);
    res.json(rows);
  }));

  // POST
  router.post(`/${endpoint}`, sanitizeInput, asyncHandler(async (req, res) => {
    const sheets = await getSheets();
    
    // Generar ID explícitamente en Node
    let nextId = '';
    const prefix = constants.PREFIX_MAP[sheetName];
    if (prefix) {
      const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId: env.SPREADSHEET_ID,
        range: `'${sheetName}'!A2:A`,
      });
      const existingData = getRes.data.values || [];
      const maxNum = existingData.reduce((max, row) => {
        const m = row[0] ? row[0].match(/\d+/) : null;
        return m ? Math.max(max, parseInt(m[0], 10)) : max;
      }, 0);
      nextId = `${prefix}${(maxNum + 1).toString().padStart(3, '0')}`;
    }

    const getRes = await sheets.spreadsheets.values.get({ spreadsheetId: env.SPREADSHEET_ID, range: `'${sheetName}'!A:A` });
    const numRows = (getRes.data.values || []).length;
    const nextRowNum = numRows + 1;

    const row = mapper(req.body, [nextId]);
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.SPREADSHEET_ID,
      range: `'${sheetName}'!A:A`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] },
    });
    
    // Notificar creación
    const nombre = req.body['Nombre'] || req.body['Nombre del Contacto'] || req.body['Nombre del Cliente'] || req.body['Nombre del Proyecto'] || req.body['Tarea'] || req.body['ID Tarea'] || 'Registro';
    const tipo = req.body['Tipo de reunión'] ? ` (${req.body['Tipo de reunión']})` : '';
    
    notifyEvent(`${sheetName} creado`, 
      `Se ha registrado un nuevo ${sheetName.toLowerCase().slice(0, -1)}: *${nombre}${tipo}*.\nRegistrado por: ${req.body['Asesor'] || req.body['Responsable'] || 'Sistema'}`);

    cache.del('sheet_' + sheetName);
    res.json({ success: true, message: 'Registro creado exitosamente', id: nextId });
  }));

  // PUT
  router.put(`/${endpoint}/:id`, sanitizeInput, asyncHandler(async (req, res) => {
    const sheets = await getSheets();
    const rowNum = await sheetsService.findRowById(sheets, sheetName, req.params.id);
    if (rowNum === -1) return res.status(404).json({ error: 'Registro no encontrado' });

    // Fetch existing row to preserve formulas
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId: env.SPREADSHEET_ID,
      range: `'${sheetName}'!A${rowNum}:${range.split(':')[1]}${rowNum}`,
      valueRenderOption: 'FORMULA',
    });
    const existingRow = getRes.data.values ? getRes.data.values[0] : [];
    if (existingRow.length > 0) existingRow[0] = req.params.id;
    else existingRow.push(req.params.id);
    
    const row = mapper(req.body, existingRow, [], rowNum);
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.SPREADSHEET_ID,
      range: `'${sheetName}'!A${rowNum}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] },
    });

    cache.del('sheet_' + sheetName);
    res.json({ success: true, message: 'Registro actualizado' });
  }));

  // DELETE
  router.delete(`/${endpoint}/:id`, asyncHandler(async (req, res) => {
    const sheets = await getSheets();
    const sheetId = await sheetsService.getSheetId(sheets, sheetName);
    if (sheetId === null) return res.status(500).json({ error: 'No se pudo obtener el ID de la hoja' });

    const rowNum = await sheetsService.findRowById(sheets, sheetName, req.params.id);
    if (rowNum === -1) return res.status(404).json({ error: 'Registro no encontrado' });

    const deleteRequest = {
      deleteDimension: {
        range: {
          sheetId: sheetId,
          dimension: 'ROWS',
          startIndex: rowNum - 1,
          endIndex: rowNum
        }
      }
    };

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: env.SPREADSHEET_ID,
      resource: { requests: [deleteRequest] },
    });

    cache.del('sheet_' + sheetName);
    res.json({ success: true, message: 'Registro eliminado permanentemente' });
  }));

}

module.exports = crudRoutes;
