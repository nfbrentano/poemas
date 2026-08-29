import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5174/poemas/admin?bypass_auth=true');
  await new Promise(r => setTimeout(r, 1000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TEXT WITH BYPASS_AUTH:\n', text);
  
  await page.goto('http://localhost:5174/poemas/admin');
  await new Promise(r => setTimeout(r, 1000));
  
  const text2 = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TEXT WITHOUT BYPASS_AUTH:\n', text2);
  
  await browser.close();
})();
