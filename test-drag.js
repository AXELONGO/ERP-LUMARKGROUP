const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000');
  
  // Log in
  await page.type('input[type="email"]', 'asesor0@empresa.com');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('Logged in!');
  
  // Go to pipeline
  await page.click('#tab-pipeline-proyectos');
  await page.waitForSelector('#pipeline-proyectos-container .kanban-card');
  console.log('Pipeline loaded!');

  // Get the first card
  const card = await page.$('#pipeline-proyectos-container .kanban-card');
  if (!card) {
    console.log('No cards found!');
    await browser.close();
    return;
  }
  
  const cardBox = await card.boundingBox();
  const cardId = await page.evaluate(el => el.getAttribute('data-id'), card);
  console.log('Card ID:', cardId, 'at', cardBox);
  
  // Get second column
  const col2 = await page.$('#pipeline-proyectos-container .kanban-col[data-status="2"]');
  const col2Box = await col2.boundingBox();
  console.log('Column 2 at', col2Box);

  // Drag and drop
  console.log('Dragging...');
  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(col2Box.x + col2Box.width / 2, col2Box.y + col2Box.height / 4, { steps: 10 });
  await page.mouse.up();
  
  // Wait to see if any console errors or network errors occur
  await new Promise(r => setTimeout(r, 2000));
  
  // Check if it moved
  const newColStatus = await page.evaluate(id => {
    const el = document.querySelector(`.kanban-card[data-id="${id}"]`);
    return el ? el.closest('.kanban-col').getAttribute('data-status') : null;
  }, cardId);
  
  console.log('New column status:', newColStatus);
  
  await browser.close();
})();
