import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5174/poemas/admin');
  await new Promise(r => setTimeout(r, 1000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TEXT:\n', text);
  
  const content = await page.content();
  if (content.includes('Erro ao carregar')) {
    console.log('Found error on page!');
    try {
      const errText = await page.$eval('.error p', err => err.textContent);
      console.log('Error text:', errText);
    } catch(e) {}
  }
  
  await browser.close();
})();
