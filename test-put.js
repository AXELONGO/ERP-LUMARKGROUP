const { getSheets } = require('./src/config/sheets');
const env = require('./src/config/env');
const mapper = require('./src/modules/index'); // wait, the mappers are mapped in index.js, but let's just write the code directly
(async () => {
  try {
    const sheets = await getSheets();
    const rowNum = 3; // PRJ-003 is row 3
    const row = [
      'PRJ-003',
      'Madi Bienes Raices',
      'CLI-003',
      'Reunión',
      '',
      'Socio de crecimiento',
      "3", // we change etapa to 3
      `=IF(G${rowNum}="","",G${rowNum}*14.285714286%)`,
      '',
      '',
      '',
      '',
      ''
    ];
    
    console.log("Sending update...");
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId: env.SPREADSHEET_ID,
      range: `'Proyectos'!A${rowNum}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] },
    });
    console.log("Success:", res.status);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
})();
