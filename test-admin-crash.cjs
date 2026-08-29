const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

(async () => {
  const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="app"></div></body></html>`, {
    url: "http://localhost:5173/admin",
    runScripts: "dangerously",
    resources: "usable"
  });

  dom.window.console.error = (msg, ...args) => console.log("ERROR:", msg, ...args);
  dom.window.console.warn = (msg, ...args) => console.log("WARN:", msg, ...args);

  // We can't easily run Vite output in pure JSDOM without a server. 
  // Let's just write a test script that imports admin.js using Node.js instead, or we can use puppeteer.
})();
