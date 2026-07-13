const { getSheets } = require('./src/config/sheets');
const env = require('./src/config/env');
(async () => {
  try {
    const sheets = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: env.SPREADSHEET_ID,
      range: 'Proyectos!A2:H3',
      valueRenderOption: 'FORMULA'
    });
    console.log(res.data.values);
  } catch (err) {
    console.error(err);
  }
})();
