const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  console.log('Navigating to set token...');
  await page.goto('http://localhost:3000');
  
  await page.evaluate(() => {
    localStorage.setItem('erp_jwt_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRldjEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc4Mzc0MTMxNH0.SYf-DqwG4AkQZjTBa33opdEiFKz33Nkn7l_NJ1Q-MFI');
    localStorage.setItem('erp_user', JSON.stringify({id: 'dev123', email: 'test@example.com', role: 'Admin'}));
  });
  
  console.log('Reloading to bypass login...');
  await page.goto('http://localhost:3000');
  
  await page.waitForSelector('#nav-pipeline', { visible: true });
  console.log('Logged in via token!');
  
  console.log('Clicking Pipeline in sidebar...');
  await page.click('#nav-pipeline');
  
  await page.waitForSelector('#pipeline-proyectos-container .kanban-card', { visible: true });
  console.log('Cards loaded.');

  const card = await page.$('#pipeline-proyectos-container .kanban-card');
  const cardId = await page.evaluate(el => el.getAttribute('data-id'), card);
  console.log('Moving card', cardId, 'to column 3');

  // Programmatic drop event to Column 3
  await page.evaluate(async (id) => {
    try {
      const col = document.querySelector('#pipeline-proyectos-container .kanban-col[data-status="3"]');
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', JSON.stringify({ id, type: 'proyectos' }));
      
      const dropEvent = new DragEvent('drop', {
        bubbles: true, cancelable: true, dataTransfer
      });
      
      console.log('Dispatching drop event...');
      col.dispatchEvent(dropEvent);
    } catch(err) {
      console.log('JS Error:', err.message);
    }
  }, cardId);

  // Wait to see the toast logs
  let toastMsgs = [];
  for (let i = 0; i < 20; i++) {
      const toastText = await page.evaluate(() => {
          const el = document.getElementById('toast');
          return (!el.classList.contains('hidden')) ? el.innerText : null;
      });
      if (toastText) {
          console.log('TOAST:', toastText);
          toastMsgs.push(toastText);
      }
      await new Promise(r => setTimeout(r, 200));
  }
  
  await browser.close();
  console.log('Test complete. Toasts seen:', [...new Set(toastMsgs)]);
})();
