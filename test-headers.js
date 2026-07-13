require('dotenv').config();
const { getPublicData } = require('/Users/axelsoberanes/Desktop/ERP LUMARK V1/src/services/sheetsService.js');

async function checkHeaders() {
  const data = await getPublicData('Proyectos');
  if (data.length > 0) {
    console.log("Proyectos headers:", Object.keys(data[0]));
  } else {
    console.log("No data found.");
  }
}
checkHeaders().catch(console.error);
