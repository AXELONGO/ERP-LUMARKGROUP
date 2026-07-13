const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    document.getElementById('email').value = 'asesor0@empresa.com';
    document.getElementById('password').value = '1234';
    document.querySelector('button[type="submit"]').click();
  });
  
  await page.waitForFunction(() => !document.getElementById('login-screen').classList.contains('hidden') === false, {timeout: 5000});
  console.log("Logged in");
  
  await page.evaluate(() => {
    document.getElementById('nav-pipeline').click();
  });
  
  await page.waitForSelector('#kanban-pipeline-proyectos .kanban-card', {timeout: 5000});
  console.log("Pipeline loaded with cards");
  
  // Find card and target column
  const dragResult = await page.evaluate(() => {
    const card = document.querySelector('.kanban-card');
    const targetCol = document.querySelector('.kanban-col[data-status="3"]');
    
    if (!card) return 'No card found';
    if (!targetCol) return 'No target col found';
    
    const dataTransfer = new DataTransfer();
    
    // Simulate dragstart
    const dragstartEvent = new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer });
    card.dispatchEvent(dragstartEvent);
    
    // Simulate drop
    const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer });
    targetCol.dispatchEvent(dropEvent);
    
    return 'Drag and drop dispatched';
  });
  
  console.log(dragResult);
  await new Promise(r => setTimeout(r, 3000));
  
  await browser.close();
})();
