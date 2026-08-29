import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5174/admin?bypass_auth=true');
  
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  if (content.includes('Erro ao carregar')) {
    console.log('Found error on page!');
    try {
      const errText = await page.$eval('.error p', el => el.textContent);
      console.log('Error text:', errText);
    } catch(e) {}
  } else {
    console.log('No error found on page.');
  }
  
  await browser.close();
})();
